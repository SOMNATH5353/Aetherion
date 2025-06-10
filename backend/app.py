from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import requests
from gtts import gTTS
import os
import re
import tempfile
import logging
from datetime import datetime, timedelta
from functools import lru_cache
from dotenv import load_dotenv
import hashlib
import json
import uuid
from collections import defaultdict
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest, 
    RunRealtimeReportRequest,
    DateRange, 
    Metric, 
    Dimension,
    MetricType
)
from google.oauth2 import service_account
from google.auth.exceptions import DefaultCredentialsError
import sqlite3
from threading import Lock
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
CACHE_DURATION = timedelta(hours=1)
AUDIO_CACHE_DURATION = timedelta(hours=6)

# Google Analytics Configuration
GA4_PROPERTY_ID = os.getenv("GA4_PROPERTY_ID", "492780465")
GA4_KEY_PATH = os.getenv("GA4_KEY_PATH", "C:/Users/Lenovo/OneDrive/Desktop/Aetherion/backend/key.json")

# Analytics client initialization
analytics_client = None
analytics_enabled = False

# Thread lock for analytics operations
analytics_lock = Lock()

# Simple in-memory cache
apod_cache = {
    'data': None,
    'timestamp': None,
    'audio_cache': {}
}

# Analytics cache
analytics_cache = {
    'active_users': {'data': 0, 'timestamp': None},
    'realtime_data': {'data': {}, 'timestamp': None},
    'visitor_stats': {'data': {}, 'timestamp': None}
}

# Cumulative tracking globals
cumulative_stats = {
    'total_unique_visitors': 0,
    'total_page_views': 0,
    'total_sessions': 0,
    'total_apod_interactions': 0,
    'total_narrations': 0,
    'total_shares': 0,
    'first_visitor_date': None,
    'last_updated': None
}

visitor_fingerprints = set()  # Track unique visitor fingerprints
session_tracking = {}  # Track active sessions

def initialize_analytics():
    """Initialize Google Analytics client with error handling."""
    global analytics_client, analytics_enabled
    
    try:
        if os.path.exists(GA4_KEY_PATH):
            credentials = service_account.Credentials.from_service_account_file(GA4_KEY_PATH)
            analytics_client = BetaAnalyticsDataClient(credentials=credentials)
            analytics_enabled = True
            logger.info("✅ Google Analytics 4 client initialized successfully")
        else:
            logger.warning(f"⚠️ GA4 key file not found at {GA4_KEY_PATH}")
            analytics_enabled = False
    except Exception as e:
        logger.error(f"❌ Failed to initialize GA4 client: {e}")
        analytics_enabled = False

def initialize_cumulative_analytics_db():
    """Initialize enhanced database with cumulative tracking."""
    try:
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        # Enhanced visitor tracking table with fingerprinting
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS unique_visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT UNIQUE,
                fingerprint_hash TEXT UNIQUE,
                first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_visits INTEGER DEFAULT 1,
                total_page_views INTEGER DEFAULT 1,
                user_agent TEXT,
                ip_hash TEXT,
                screen_resolution TEXT,
                timezone TEXT,
                language TEXT,
                country TEXT,
                device_type TEXT,
                browser TEXT,
                os TEXT,
                is_return_visitor BOOLEAN DEFAULT FALSE,
                referrer TEXT
            )
        ''')
        
        # Cumulative stats table for all-time metrics
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cumulative_stats (
                id INTEGER PRIMARY KEY,
                total_unique_visitors INTEGER DEFAULT 0,
                total_page_views INTEGER DEFAULT 0,
                total_sessions INTEGER DEFAULT 0,
                total_apod_interactions INTEGER DEFAULT 0,
                total_narrations INTEGER DEFAULT 0,
                total_shares INTEGER DEFAULT 0,
                total_downloads INTEGER DEFAULT 0,
                total_time_spent INTEGER DEFAULT 0,
                first_visitor_date DATETIME,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Session tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS visitor_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                visitor_id TEXT,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                duration_seconds INTEGER DEFAULT 0,
                pages_visited INTEGER DEFAULT 1,
                interactions_count INTEGER DEFAULT 0,
                referrer TEXT,
                entry_page TEXT,
                exit_page TEXT,
                device_info TEXT,
                FOREIGN KEY (visitor_id) REFERENCES unique_visitors (visitor_id)
            )
        ''')
        
        # Page views table with enhanced tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT,
                session_id TEXT,
                page_path TEXT,
                page_title TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_agent TEXT,
                referrer TEXT,
                ip_address TEXT,
                time_on_page INTEGER DEFAULT 0,
                scroll_depth INTEGER DEFAULT 0,
                viewport_size TEXT,
                device_info TEXT
            )
        ''')
        
        # APOD interactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS apod_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT,
                session_id TEXT,
                action TEXT,
                apod_date TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                additional_data TEXT,
                interaction_duration INTEGER DEFAULT 0
            )
        ''')
        
        # Visitor daily summary table for analytics
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_visitor_summary (
                date TEXT PRIMARY KEY,
                unique_visitors INTEGER DEFAULT 0,
                total_page_views INTEGER DEFAULT 0,
                total_sessions INTEGER DEFAULT 0,
                total_interactions INTEGER DEFAULT 0,
                avg_session_duration REAL DEFAULT 0,
                bounce_rate REAL DEFAULT 0,
                new_visitors INTEGER DEFAULT 0,
                returning_visitors INTEGER DEFAULT 0
            )
        ''')
        
        # Insert initial cumulative stats row if not exists
        cursor.execute('''
            INSERT OR IGNORE INTO cumulative_stats (id) VALUES (1)
        ''')
        
        # Load existing cumulative stats into memory
        cursor.execute('SELECT * FROM cumulative_stats WHERE id = 1')
        row = cursor.fetchone()
        if row:
            global cumulative_stats
            cumulative_stats = {
                'total_unique_visitors': row[1] or 0,
                'total_page_views': row[2] or 0,
                'total_sessions': row[3] or 0,
                'total_apod_interactions': row[4] or 0,
                'total_narrations': row[5] or 0,
                'total_shares': row[6] or 0,
                'total_downloads': row[7] or 0,
                'total_time_spent': row[8] or 0,
                'first_visitor_date': row[9],
                'last_updated': row[10]
            }
        
        # Load visitor fingerprints into memory for fast lookup
        cursor.execute('SELECT fingerprint_hash FROM unique_visitors WHERE fingerprint_hash IS NOT NULL')
        global visitor_fingerprints
        visitor_fingerprints = {row[0] for row in cursor.fetchall()}
        
        conn.commit()
        conn.close()
        
        logger.info("✅ Enhanced cumulative analytics database initialized")
        logger.info(f"📊 Loaded {cumulative_stats['total_unique_visitors']} total unique visitors")
        logger.info(f"🔑 Loaded {len(visitor_fingerprints)} visitor fingerprints")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize cumulative analytics DB: {e}")

def generate_visitor_fingerprint(request_data):
    """Generate sophisticated visitor fingerprint for deduplication."""
    try:
        # Extract key identifying information
        user_agent = request_data.get('user_agent', '')
        screen_resolution = request_data.get('screen_resolution', '')
        timezone = request_data.get('timezone', '')
        language = request_data.get('language', '')
        ip_address = request_data.get('ip_address', '')
        viewport_size = request_data.get('viewport_size', '')
        color_depth = request_data.get('color_depth', '')
        device_memory = request_data.get('device_memory', '')
        
        # Create stable fingerprint (anonymized)
        fingerprint_components = [
            user_agent[:100],  # First 100 chars of user agent
            screen_resolution,
            timezone,
            language,
            ip_address[:12] if ip_address else '',  # Partial IP for privacy
            viewport_size,
            color_depth,
            device_memory
        ]
        
        fingerprint_string = '|'.join(str(comp) for comp in fingerprint_components)
        fingerprint_hash = hashlib.sha256(fingerprint_string.encode()).hexdigest()
        
        return fingerprint_hash
        
    except Exception as e:
        logger.error(f"Error generating fingerprint: {e}")
        return f"fallback_{int(time.time())}"

def extract_device_info(user_agent):
    """Extract device, browser, and OS information from user agent."""
    try:
        user_agent = user_agent.lower()
        
        # Detect device type
        device_type = 'desktop'
        if any(mobile in user_agent for mobile in ['mobile', 'android', 'iphone', 'ipad']):
            device_type = 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            device_type = 'tablet'
        
        # Detect browser
        browser = 'unknown'
        if 'chrome' in user_agent and 'edg' not in user_agent:
            browser = 'chrome'
        elif 'firefox' in user_agent:
            browser = 'firefox'
        elif 'safari' in user_agent and 'chrome' not in user_agent:
            browser = 'safari'
        elif 'edg' in user_agent:
            browser = 'edge'
        elif 'opera' in user_agent:
            browser = 'opera'
        
        # Detect OS
        os_type = 'unknown'
        if 'windows' in user_agent:
            os_type = 'windows'
        elif 'mac' in user_agent:
            os_type = 'macos'
        elif 'linux' in user_agent:
            os_type = 'linux'
        elif 'android' in user_agent:
            os_type = 'android'
        elif 'ios' in user_agent or 'iphone' in user_agent or 'ipad' in user_agent:
            os_type = 'ios'
        
        return {
            'device_type': device_type,
            'browser': browser,
            'os': os_type
        }
        
    except Exception as e:
        logger.error(f"Error extracting device info: {e}")
        return {'device_type': 'unknown', 'browser': 'unknown', 'os': 'unknown'}

def track_cumulative_visitor(visitor_data):
    """Track visitor in cumulative system with advanced deduplication."""
    try:
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        visitor_id = visitor_data.get('visitor_id')
        fingerprint_hash = generate_visitor_fingerprint(visitor_data)
        
        # Extract device information
        device_info = extract_device_info(visitor_data.get('user_agent', ''))
        
        # Check if this is a truly unique visitor
        cursor.execute('''
            SELECT id, total_visits, is_return_visitor FROM unique_visitors 
            WHERE visitor_id = ? OR fingerprint_hash = ?
            LIMIT 1
        ''', (visitor_id, fingerprint_hash))
        
        existing_visitor = cursor.fetchone()
        is_new_visitor = existing_visitor is None
        
        global cumulative_stats, visitor_fingerprints
        
        current_time = datetime.now()
        
        if is_new_visitor:
            # Completely new unique visitor
            cursor.execute('''
                INSERT INTO unique_visitors (
                    visitor_id, fingerprint_hash, first_visit, last_visit,
                    total_visits, total_page_views, user_agent, ip_hash,
                    screen_resolution, timezone, language, device_type,
                    browser, os, is_return_visitor, referrer
                ) VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)
            ''', (
                visitor_id,
                fingerprint_hash,
                current_time,
                current_time,
                visitor_data.get('user_agent', ''),
                hashlib.sha256(str(visitor_data.get('ip_address', '')).encode()).hexdigest()[:16],
                visitor_data.get('screen_resolution', ''),
                visitor_data.get('timezone', ''),
                visitor_data.get('language', ''),
                device_info['device_type'],
                device_info['browser'],
                device_info['os'],
                visitor_data.get('referrer', '')
            ))
            
            # Update cumulative stats
            cumulative_stats['total_unique_visitors'] += 1
            cumulative_stats['total_page_views'] += 1
            cumulative_stats['total_sessions'] += 1
            
            # Set first visitor date if this is the very first visitor
            if cumulative_stats['first_visitor_date'] is None:
                cumulative_stats['first_visitor_date'] = current_time.isoformat()
            
            # Add to fingerprints set
            visitor_fingerprints.add(fingerprint_hash)
            
            logger.info(f"🆕 New unique visitor #{cumulative_stats['total_unique_visitors']}: {visitor_id[:8]}... ({device_info['device_type']}/{device_info['browser']})")
            
        else:
            # Returning visitor - update their record
            cursor.execute('''
                UPDATE unique_visitors 
                SET last_visit = ?, 
                    total_visits = total_visits + 1,
                    total_page_views = total_page_views + 1,
                    is_return_visitor = TRUE
                WHERE visitor_id = ? OR fingerprint_hash = ?
            ''', (current_time, visitor_id, fingerprint_hash))
            
            # Only increment page views for returning visitors
            cumulative_stats['total_page_views'] += 1
            
            logger.info(f"🔄 Returning visitor: {visitor_id[:8]}... (visit #{existing_visitor[1] + 1})")
        
        # Update cumulative stats in database
        cumulative_stats['last_updated'] = current_time.isoformat()
        
        cursor.execute('''
            UPDATE cumulative_stats SET
                total_unique_visitors = ?,
                total_page_views = ?,
                total_sessions = ?,
                first_visitor_date = ?,
                last_updated = ?
            WHERE id = 1
        ''', (
            cumulative_stats['total_unique_visitors'],
            cumulative_stats['total_page_views'],
            cumulative_stats['total_sessions'],
            cumulative_stats['first_visitor_date'],
            current_time
        ))
        
        # Update daily summary
        today = current_time.date().isoformat()
        cursor.execute('''
            INSERT OR REPLACE INTO daily_visitor_summary (
                date, unique_visitors, total_page_views, total_sessions, new_visitors
            ) VALUES (
                ?,
                COALESCE((SELECT unique_visitors FROM daily_visitor_summary WHERE date = ?), 0) + ?,
                COALESCE((SELECT total_page_views FROM daily_visitor_summary WHERE date = ?), 0) + 1,
                COALESCE((SELECT total_sessions FROM daily_visitor_summary WHERE date = ?), 0) + ?,
                COALESCE((SELECT new_visitors FROM daily_visitor_summary WHERE date = ?), 0) + ?
            )
        ''', (today, today, 1 if is_new_visitor else 0, today, today, 1 if is_new_visitor else 0, today, 1 if is_new_visitor else 0))
        
        conn.commit()
        conn.close()
        
        return is_new_visitor
        
    except Exception as e:
        logger.error(f"Error tracking cumulative visitor: {e}")
        return False

def track_session(session_data):
    """Track visitor session with duration and interactions."""
    try:
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        session_id = session_data.get('session_id')
        visitor_id = session_data.get('visitor_id')
        
        # Check if session exists
        cursor.execute('SELECT id FROM visitor_sessions WHERE session_id = ?', (session_id,))
        existing_session = cursor.fetchone()
        
        if not existing_session:
            # New session
            cursor.execute('''
                INSERT INTO visitor_sessions (
                    session_id, visitor_id, start_time, pages_visited,
                    referrer, entry_page, device_info
                ) VALUES (?, ?, ?, 1, ?, ?, ?)
            ''', (
                session_id,
                visitor_id,
                datetime.now(),
                session_data.get('referrer', ''),
                session_data.get('page_path', '/'),
                json.dumps(session_data.get('device_info', {}))
            ))
        else:
            # Update existing session
            cursor.execute('''
                UPDATE visitor_sessions SET
                    pages_visited = pages_visited + 1,
                    exit_page = ?,
                    end_time = ?
                WHERE session_id = ?
            ''', (session_data.get('page_path', '/'), datetime.now(), session_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error tracking session: {e}")

def track_cumulative_interaction(interaction_type, data=None):
    """Track cumulative interactions and update counters."""
    try:
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        global cumulative_stats
        
        if interaction_type == 'apod_interaction':
            cumulative_stats['total_apod_interactions'] += 1
        elif interaction_type == 'narration':
            cumulative_stats['total_narrations'] += 1
        elif interaction_type == 'share':
            cumulative_stats['total_shares'] += 1
        elif interaction_type == 'download':
            cumulative_stats['total_downloads'] += 1
        
        # Update database
        cursor.execute('''
            UPDATE cumulative_stats SET
                total_apod_interactions = ?,
                total_narrations = ?,
                total_shares = ?,
                total_downloads = ?,
                last_updated = ?
            WHERE id = 1
        ''', (
            cumulative_stats['total_apod_interactions'],
            cumulative_stats['total_narrations'],
            cumulative_stats['total_shares'],
            cumulative_stats['total_downloads'],
            datetime.now()
        ))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error tracking cumulative interaction: {e}")

def clean_text_for_speech(text):
    """
    Clean and optimize text for better text-to-speech output with improved pronunciation.
    """
    if not text:
        return "No description available."
    
    # Remove unwanted patterns
    cleaned_text = text
    
    # Remove APOD anniversary announcements
    cleaned_text = re.sub(r'APOD\s+Turns?\s+\d+!?[:\s]*', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove lecture announcements
    cleaned_text = re.sub(r'Free\s+Public\s+Lecture.*?(?:\d{1,2}\s*(?:am|pm)|\d{4})', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove event announcements with dates
    cleaned_text = re.sub(r'(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove standalone dates
    cleaned_text = re.sub(r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove city names in event contexts
    cleaned_text = re.sub(r'\bin\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+on\s+', '', cleaned_text, flags=re.IGNORECASE)
    
    # Enhanced pronunciation fixes for more natural speech
    pronunciation_fixes = {
        # Astronomical catalogs - more natural pronunciation
        r'\bNGC\s*(\d+)': r'N G C \1',
        r'\bIC\s*(\d+)': r'I C \1', 
        r'\bHD\s*(\d+)': r'H D \1',
        r'\bHR\s*(\d+)': r'H R \1',
        r'\bGJ\s*(\d+)': r'G J \1',
        
        # Messier objects - proper pronunciation
        r'\bM\s*(\d+)': r'Messier \1',
        
        # Units - more conversational
        r'\bkm/s\b': 'kilometers per second',
        r'\bkm\b': 'kilometers',
        r'\bAU\b': 'astronomical units',
        r'\bly\b': 'light years',
        r'\bμm\b': 'micrometers',
        r'\bnm\b': 'nanometers',
        r'\barcsec\b': 'arc seconds',
        r'\barcmin\b': 'arc minutes',
        r'\bmag\b': 'magnitude',
        
        # Scientific terms - clearer pronunciation
        r'\bH-alpha\b': 'H alpha',
        r'\bH\s*α\b': 'H alpha',
        r'\bHα\b': 'H alpha',
        r'\bCa\s*II\b': 'calcium two',
        r'\bO\s*III\b': 'oxygen three',
        r'\bH\s*II\b': 'H two',
        
        # Common astronomical terms
        r'\bRA\b': 'right ascension',
        r'\bDec\b': 'declination',
        r'\bUTC\b': 'coordinated universal time',
        r'\bGMT\b': 'Greenwich mean time',
        
        # Coordinates - more natural
        r'(\d+)°': r'\1 degrees',
        r'(\d+)\'': r'\1 arc minutes',
        r'(\d+)\"': r'\1 arc seconds',
        
        # Common abbreviations
        r'\betc\.\b': 'and so on',
        r'\be\.g\.\b': 'for example',
        r'\bi\.e\.\b': 'that is',
        r'\bvs\.\b': 'versus',
        
        # Technical measurements - clearer pronunciation
        r'(\d+)\s*x\s*(\d+)': r'\1 by \2',
        r'(\d+)-(\d+)': r'\1 to \2',
    }
    
    # Apply pronunciation fixes
    for pattern, replacement in pronunciation_fixes.items():
        cleaned_text = re.sub(pattern, replacement, cleaned_text, flags=re.IGNORECASE)
    
    # Add natural pauses for better speech flow
    # Add pauses after sentences
    cleaned_text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', cleaned_text)
    
    # Add slight pauses after commas for better flow
    cleaned_text = re.sub(r',\s*', ', ', cleaned_text)
    
    # Ensure numbers are pronounced naturally
    cleaned_text = re.sub(r'\b(\d{4})\b', lambda m: f"{m.group(1)[:2]} {m.group(1)[2:]}" if len(m.group(1)) == 4 else m.group(1), cleaned_text)
    
    # Clean up extra whitespace
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    # Remove leading/trailing punctuation
    cleaned_text = re.sub(r'^[:\s,.-]+|[:\s,.-]+$', '', cleaned_text)
    
    # Ensure we have reasonable content
    if len(cleaned_text) < 50 and len(text) > 100:
        return text  # Return original if cleaning made it too short
    
    return cleaned_text if cleaned_text else "No description available."

def is_cache_valid(timestamp, duration):
    """Check if cache is still valid."""
    if timestamp is None:
        return False
    return datetime.now() - timestamp < duration

def is_analytics_cache_valid(cache_key, duration_minutes=5):
    """Check if analytics cache is still valid."""
    cache_data = analytics_cache.get(cache_key, {})
    timestamp = cache_data.get('timestamp')
    if timestamp is None:
        return False
    return datetime.now() - timestamp < timedelta(minutes=duration_minutes)

@lru_cache(maxsize=128)
def fetch_nasa_apod(date=None):
    """
    Fetch APOD data from NASA API with caching.
    """
    try:
        url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        if date:
            url += f"&date={date}"
        
        logger.info(f"Fetching APOD data from NASA API: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        logger.info("Successfully fetched APOD data")
        return data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching APOD data: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise

def track_enhanced_analytics(event_type, data):
    """Enhanced analytics tracking with cumulative and session tracking."""
    try:
        if event_type == 'page_view':
            # Enhanced visitor data collection
            visitor_data = {
                'visitor_id': data.get('visitor_id'),
                'user_agent': data.get('user_agent'),
                'ip_address': data.get('ip_address'),
                'screen_resolution': data.get('screen_resolution', ''),
                'viewport_size': data.get('viewport_size', ''),
                'timezone': data.get('timezone', ''),
                'language': data.get('language', ''),
                'color_depth': data.get('color_depth', ''),
                'device_memory': data.get('device_memory', ''),
                'referrer': data.get('referrer', ''),
                'page_path': data.get('page_path', '/')
            }
            
            # Track in cumulative system
            is_new_visitor = track_cumulative_visitor(visitor_data)
            
            # Track session
            session_data = {
                'session_id': data.get('session_id'),
                'visitor_id': data.get('visitor_id'),
                'page_path': data.get('page_path', '/'),
                'referrer': data.get('referrer', ''),
                'device_info': extract_device_info(data.get('user_agent', ''))
            }
            track_session(session_data)
            
            # Store in page views table
            conn = sqlite3.connect('analytics.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO page_views (
                    visitor_id, session_id, page_path, page_title, timestamp,
                    user_agent, referrer, ip_address, viewport_size, device_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('visitor_id'),
                data.get('session_id'),
                data.get('page_path', '/'),
                data.get('page_title', ''),
                datetime.now(),
                data.get('user_agent'),
                data.get('referrer'),
                data.get('ip_address'),
                data.get('viewport_size', ''),
                json.dumps(extract_device_info(data.get('user_agent', '')))
            ))
            
            conn.commit()
            conn.close()
            
            return is_new_visitor
            
        elif event_type == 'apod_interaction':
            # Track APOD interactions
            conn = sqlite3.connect('analytics.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO apod_interactions (
                    visitor_id, session_id, action, apod_date, 
                    additional_data, interaction_duration
                ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data.get('visitor_id'),
                data.get('session_id'),
                data.get('action'),
                data.get('apod_date'),
                json.dumps(data.get('additional_data', {})),
                data.get('duration', 0)
            ))
            
            conn.commit()
            conn.close()
            
            # Track in cumulative system
            track_cumulative_interaction('apod_interaction', data)
            
            # Track specific interaction types
            action = data.get('action', '').lower()
            if 'narration' in action:
                track_cumulative_interaction('narration', data)
            elif 'share' in action:
                track_cumulative_interaction('share', data)
            elif 'download' in action:
                track_cumulative_interaction('download', data)
                
        return True
        
    except Exception as e:
        logger.error(f"Error in enhanced analytics tracking: {e}")
        return False

def get_next_milestone(current_visitors):
    """Calculate next major milestone."""
    milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000]
    for milestone in milestones:
        if current_visitors < milestone:
            return milestone
    return ((current_visitors // 100000) + 1) * 100000

# Initialize analytics on startup
initialize_analytics()
initialize_cumulative_analytics_db()

# ================================
# NASA APOD ENDPOINTS
# ================================

@app.route('/apod', methods=['GET'])
def get_apod():
    """
    Fetch the NASA Astronomy Picture of the Day (APOD) data with caching.
    """
    try:
        # Check if cached data is still valid
        if (apod_cache['data'] and 
            is_cache_valid(apod_cache['timestamp'], CACHE_DURATION)):
            logger.info("Returning cached APOD data")
            return jsonify(apod_cache['data'])
        
        # Get date parameter if provided
        date = request.args.get('date')
        
        # Fetch fresh data
        data = fetch_nasa_apod(date)
        
        # Process and structure the response
        response_data = {
            'title': data.get('title', 'Unknown Title'),
            'url': data.get('url', ''),
            'hdurl': data.get('hdurl', data.get('url', '')),
            'explanation': data.get('explanation', 'No explanation available.'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'media_type': data.get('media_type', 'image'),
            'copyright': data.get('copyright'),
            'service_version': data.get('service_version', 'v1')
        }
        
        # Clean explanation for better display
        if response_data['explanation']:
            response_data['explanation'] = clean_text_for_speech(response_data['explanation'])
        
        # Cache the data
        apod_cache['data'] = response_data
        apod_cache['timestamp'] = datetime.now()
        
        logger.info("Successfully processed and cached APOD data")
        return jsonify(response_data)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {e}")
        return jsonify({
            'error': 'Failed to fetch data from NASA API',
            'message': str(e)
        }), 503
        
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/narrate', methods=['GET'])
def narrate_apod():
    """
    Generate enhanced voice narration for APOD explanation with improved human-like speech.
    """
    try:
        # Get parameters
        date = request.args.get('date')
        voice_speed = request.args.get('speed', 'normal')
        lang = request.args.get('lang', 'en')
        
        # Track narration request
        track_enhanced_analytics('apod_interaction', {
            'visitor_id': request.headers.get('X-Visitor-ID'),
            'session_id': request.headers.get('X-Session-ID'),
            'action': 'narration_requested',
            'apod_date': date,
            'additional_data': {'speed': voice_speed, 'lang': lang}
        })
        
        # Fetch APOD data
        data = fetch_nasa_apod(date)
        explanation = data.get('explanation', 'No explanation available today.')
        title = data.get('title', 'Unknown Title')
        
        # Clean text for speech
        clean_explanation = clean_text_for_speech(explanation)
        
        # Create more natural narration with better introduction
        narration_text = f"Welcome to today's Astronomy Picture of the Day. "
        narration_text += f"Today we're exploring: {title}. "
        narration_text += f"Here's what makes this cosmic wonder special. "
        narration_text += clean_explanation
        
        # Create cache key
        cache_key = hashlib.md5(f"{narration_text}_{voice_speed}_{lang}".encode()).hexdigest()
        
        # Check audio cache
        audio_cache = apod_cache.get('audio_cache', {})
        if (cache_key in audio_cache and 
            is_cache_valid(audio_cache[cache_key]['timestamp'], AUDIO_CACHE_DURATION)):
            logger.info("Returning cached audio file")
            return send_file(
                audio_cache[cache_key]['path'], 
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name=f"apod_narration_{data.get('date', 'today')}.mp3"
            )
        
        # Generate new audio with enhanced settings
        logger.info("Generating new enhanced TTS audio")
        
        tts_slow = voice_speed == 'slow'
        
        # Use different TLD for more natural voice
        tld_options = {
            'en': 'co.uk',
            'es': 'com.mx',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'com.br'
        }
        
        tld = tld_options.get(lang[:2], 'com')
        
        # Generate speech with enhanced parameters
        tts = gTTS(
            text=narration_text, 
            lang=lang, 
            slow=tts_slow,
            tld=tld
        )
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix='.mp3',
            prefix='apod_narration_'
        )
        
        # Save audio to temporary file
        tts.save(temp_file.name)
        
        # Cache the audio file info
        if 'audio_cache' not in apod_cache:
            apod_cache['audio_cache'] = {}
            
        apod_cache['audio_cache'][cache_key] = {
            'path': temp_file.name,
            'timestamp': datetime.now()
        }
        
        # Clean up old cache files (keep only last 5)
        if len(apod_cache['audio_cache']) > 5:
            oldest_key = min(
                apod_cache['audio_cache'].keys(),
                key=lambda k: apod_cache['audio_cache'][k]['timestamp']
            )
            old_file = apod_cache['audio_cache'][oldest_key]['path']
            try:
                os.unlink(old_file)
            except OSError:
                pass
            del apod_cache['audio_cache'][oldest_key]
        
        # Track successful narration generation
        track_enhanced_analytics('apod_interaction', {
            'visitor_id': request.headers.get('X-Visitor-ID'),
            'session_id': request.headers.get('X-Session-ID'),
            'action': 'narration_generated',
            'apod_date': date,
            'additional_data': {'duration': 'unknown', 'cache_hit': False}
        })
        
        logger.info("Successfully generated enhanced TTS audio")
        
        return send_file(
            temp_file.name, 
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name=f"apod_narration_{data.get('date', 'today')}.mp3"
        )
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in narration: {e}")
        return jsonify({
            'error': 'Failed to fetch APOD data for narration',
            'message': str(e)
        }), 503
        
    except Exception as e:
        logger.error(f"Error generating narration: {e}")
        return jsonify({
            'error': 'Failed to generate voice narration',
            'message': str(e)
        }), 500

# ================================
# CUMULATIVE ANALYTICS ENDPOINTS
# ================================

@app.route('/analytics/cumulative-stats', methods=['GET'])
def get_cumulative_stats():
    """Get comprehensive all-time cumulative statistics."""
    try:
        global cumulative_stats
        
        # Calculate additional metrics
        days_since_launch = 1
        if cumulative_stats['first_visitor_date']:
            try:
                first_date = datetime.fromisoformat(cumulative_stats['first_visitor_date'].replace('Z', '+00:00'))
                days_since_launch = max(1, (datetime.now() - first_date).days + 1)
            except:
                days_since_launch = 1
        
        # Calculate averages
        avg_visitors_per_day = cumulative_stats['total_unique_visitors'] / days_since_launch
        avg_page_views_per_visitor = cumulative_stats['total_page_views'] / max(cumulative_stats['total_unique_visitors'], 1)
        avg_interactions_per_visitor = cumulative_stats['total_apod_interactions'] / max(cumulative_stats['total_unique_visitors'], 1)
        
        # Get recent activity (last 24 hours)
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(DISTINCT visitor_id) as recent_visitors,
                   COUNT(*) as recent_page_views
            FROM page_views 
            WHERE timestamp >= datetime('now', '-1 day')
        ''')
        
        recent_stats = cursor.fetchone()
        
        # Get growth metrics (last 7 days vs previous 7 days)
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT visitor_id) as visitors_week,
                COUNT(*) as views_week
            FROM page_views 
            WHERE timestamp >= datetime('now', '-7 days')
        ''')
        
        current_week = cursor.fetchone()
        
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT visitor_id) as visitors_prev_week,
                COUNT(*) as views_prev_week
            FROM page_views 
            WHERE timestamp >= datetime('now', '-14 days') 
                AND timestamp < datetime('now', '-7 days')
        ''')
        
        previous_week = cursor.fetchone()
        
        # Calculate growth rates
        visitor_growth = 0
        if previous_week and previous_week[0] > 0:
            visitor_growth = ((current_week[0] - previous_week[0]) / previous_week[0]) * 100
        
        # Get device breakdown for recent visitors
        cursor.execute('''
            SELECT device_info, COUNT(DISTINCT visitor_id) as count
            FROM page_views 
            WHERE timestamp >= datetime('now', '-7 days')
                AND device_info IS NOT NULL
            GROUP BY device_info
        ''')
        
        device_stats = cursor.fetchall()
        device_breakdown = {}
        for device_info, count in device_stats:
            try:
                device_data = json.loads(device_info)
                device_type = device_data.get('device_type', 'unknown')
                device_breakdown[device_type] = device_breakdown.get(device_type, 0) + count
            except:
                device_breakdown['unknown'] = device_breakdown.get('unknown', 0) + count
        
        conn.close()
        
        # Build comprehensive response
        response_data = {
            'cumulative': {
                'totalUniqueVisitors': cumulative_stats['total_unique_visitors'],
                'totalPageViews': cumulative_stats['total_page_views'],
                'totalSessions': cumulative_stats['total_sessions'],
                'totalApodInteractions': cumulative_stats['total_apod_interactions'],
                'totalNarrations': cumulative_stats['total_narrations'],
                'totalShares': cumulative_stats['total_shares'],
                'totalDownloads': cumulative_stats['total_downloads'],
                'firstVisitorDate': cumulative_stats['first_visitor_date'],
                'daysSinceLaunch': days_since_launch,
                'lastUpdated': cumulative_stats['last_updated']
            },
            'averages': {
                'visitorsPerDay': round(avg_visitors_per_day, 2),
                'pageViewsPerVisitor': round(avg_page_views_per_visitor, 2),
                'interactionsPerVisitor': round(avg_interactions_per_visitor, 2),
                'sessionsPerVisitor': round(cumulative_stats['total_sessions'] / max(cumulative_stats['total_unique_visitors'], 1), 2)
            },
            'recent24h': {
                'visitors': recent_stats[0] if recent_stats else 0,
                'pageViews': recent_stats[1] if recent_stats else 0
            },
            'growth': {
                'currentWeekVisitors': current_week[0] if current_week else 0,
                'previousWeekVisitors': previous_week[0] if previous_week else 0,
                'visitorGrowthPercent': round(visitor_growth, 1),
                'currentWeekViews': current_week[1] if current_week else 0,
                'previousWeekViews': previous_week[1] if previous_week else 0
            },
            'deviceBreakdown': device_breakdown,
            'milestones': {
                'next100': 100 - (cumulative_stats['total_unique_visitors'] % 100),
                'next1000': 1000 - (cumulative_stats['total_unique_visitors'] % 1000),
                'nextMajor': get_next_milestone(cumulative_stats['total_unique_visitors']),
                'progressToNext': (cumulative_stats['total_unique_visitors'] % 1000) / 10  # Progress as percentage
            },
            'engagement': {
                'interactionRate': round((cumulative_stats['total_apod_interactions'] / max(cumulative_stats['total_page_views'], 1)) * 100, 2),
                'narrationRate': round((cumulative_stats['total_narrations'] / max(cumulative_stats['total_apod_interactions'], 1)) * 100, 2),
                'shareRate': round((cumulative_stats['total_shares'] / max(cumulative_stats['total_apod_interactions'], 1)) * 100, 2)
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error getting cumulative stats: {e}")
        return jsonify({'error': 'Failed to fetch cumulative statistics'}), 500

@app.route('/analytics/track/enhanced-page-view', methods=['POST'])
def track_enhanced_page_view():
    """Track page view with enhanced visitor fingerprinting and deduplication."""
    try:
        data = request.get_json()
        
        # Enhanced client information
        visitor_id = data.get('visitor_id') or request.headers.get('X-Visitor-ID')
        session_id = data.get('session_id') or request.headers.get('X-Session-ID')
        
        analytics_data = {
            'visitor_id': visitor_id,
            'session_id': session_id,
            'page_path': data.get('page_path', '/'),
            'page_title': data.get('page_title', ''),
            'user_agent': request.headers.get('User-Agent'),
            'referrer': data.get('referrer', ''),
            'ip_address': request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR')),
            'screen_resolution': data.get('screen_resolution', ''),
            'viewport_size': data.get('viewport_size', ''),
            'timezone': data.get('timezone', ''),
            'language': data.get('language', ''),
            'color_depth': data.get('color_depth', ''),
            'device_memory': data.get('device_memory', ''),
            'connection_type': data.get('connection_type', '')
        }
        
        # Track in enhanced system
        is_new_visitor = track_enhanced_analytics('page_view', analytics_data)
        
        # Return current cumulative stats with visitor status
        return jsonify({
            'status': 'tracked',
            'timestamp': datetime.now().isoformat(),
            'totalVisitors': cumulative_stats['total_unique_visitors'],
            'totalPageViews': cumulative_stats['total_page_views'],
            'isNewVisitor': is_new_visitor,
            'visitorNumber': cumulative_stats['total_unique_visitors'] if is_new_visitor else None
        })
        
    except Exception as e:
        logger.error(f"Error tracking enhanced page view: {e}")
        return jsonify({'error': 'Failed to track enhanced page view'}), 500

@app.route('/analytics/track/apod-interaction', methods=['POST'])
def track_apod_interaction():
    """Track APOD interaction events with enhanced analytics."""
    try:
        data = request.get_json()
        
        visitor_id = data.get('visitor_id') or request.headers.get('X-Visitor-ID')
        session_id = data.get('session_id') or request.headers.get('X-Session-ID')
        
        analytics_data = {
            'visitor_id': visitor_id,
            'session_id': session_id,
            'action': data.get('action', 'unknown'),
            'apod_date': data.get('apod_date', datetime.now().strftime('%Y-%m-%d')),
            'additional_data': data.get('additional_data', {}),
            'duration': data.get('duration', 0)
        }
        
        # Track in enhanced system
        track_enhanced_analytics('apod_interaction', analytics_data)
        
        return jsonify({
            'status': 'tracked',
            'timestamp': datetime.now().isoformat(),
            'totalInteractions': cumulative_stats['total_apod_interactions']
        })
        
    except Exception as e:
        logger.error(f"Error tracking APOD interaction: {e}")
        return jsonify({'error': 'Failed to track APOD interaction'}), 500

@app.route('/analytics/visitor-ranking/<visitor_id>', methods=['GET'])
def get_visitor_ranking(visitor_id):
    """Get ranking information for a specific visitor."""
    try:
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        # Get visitor's first visit date
        cursor.execute('''
            SELECT first_visit, total_visits, total_page_views
            FROM unique_visitors 
            WHERE visitor_id = ?
        ''', (visitor_id,))
        
        visitor_info = cursor.fetchone()
        
        if not visitor_info:
            return jsonify({'error': 'Visitor not found'}), 404
        
        first_visit, total_visits, total_page_views = visitor_info
        
        # Get visitor's ranking (based on first visit time)
        cursor.execute('''
            SELECT COUNT(*) + 1 as ranking
            FROM unique_visitors 
            WHERE first_visit < ?
        ''', (first_visit,))
        
        ranking = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'visitorId': visitor_id,
            'ranking': ranking,
            'totalVisitors': cumulative_stats['total_unique_visitors'],
            'firstVisit': first_visit,
            'totalVisits': total_visits,
            'totalPageViews': total_page_views,
            'isInTop100': ranking <= 100,
            'isInTop1000': ranking <= 1000
        })
        
    except Exception as e:
        logger.error(f"Error getting visitor ranking: {e}")
        return jsonify({'error': 'Failed to get visitor ranking'}), 500

# ================================
# GOOGLE ANALYTICS 4 ENDPOINTS (Existing)
# ================================

@app.route('/analytics/active-users', methods=['GET'])
def get_active_users():
    """Fetch active users in real-time from GA4."""
    if not analytics_enabled:
        # Return local fallback with recent visitors
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(DISTINCT visitor_id) 
            FROM page_views 
            WHERE timestamp >= datetime('now', '-5 minutes')
        ''')
        active_users = cursor.fetchone()[0]
        conn.close()
        return jsonify({"activeUsers": active_users})
    
    try:
        with analytics_lock:
            # Check cache first
            if is_analytics_cache_valid('active_users', 2):  # 2-minute cache
                return jsonify({"activeUsers": analytics_cache['active_users']['data']})
            
            request_data = RunRealtimeReportRequest(
                property=f"properties/{GA4_PROPERTY_ID}",
                metrics=[Metric(name="activeUsers")]
            )

            response = analytics_client.run_realtime_report(request_data)
            
            if response.rows:
                active_users = int(response.rows[0].metric_values[0].value)
            else:
                active_users = 0
            
            # Update cache
            analytics_cache['active_users'] = {
                'data': active_users,
                'timestamp': datetime.now()
            }
            
            return jsonify({"activeUsers": active_users})
            
    except Exception as e:
        logger.error(f"Error fetching active users: {e}")
        return jsonify({"error": "Failed to fetch active users", "activeUsers": 0}), 500

# ================================
# ADMIN DASHBOARD ENDPOINTS
# ================================

@app.route('/admin/analytics/dashboard', methods=['GET'])
def get_admin_dashboard():
    """Get comprehensive analytics for admin dashboard."""
    try:
        # Get parameters
        days = int(request.args.get('days', 7))
        
        # Get cumulative stats
        cumulative_response = get_cumulative_stats()
        cumulative_data = cumulative_response.get_json()
        
        # Get recent analytics
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        
        # Get daily breakdown for the specified period
        cursor.execute('''
            SELECT 
                DATE(timestamp) as date,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(*) as page_views,
                COUNT(DISTINCT session_id) as sessions
            FROM page_views 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY DATE(timestamp)
            ORDER BY date ASC
        '''.format(days))
        
        daily_breakdown = [
            {
                'date': row[0],
                'visitors': row[1],
                'pageViews': row[2],
                'sessions': row[3]
            }
            for row in cursor.fetchall()
        ]
        
        # Get top pages
        cursor.execute('''
            SELECT 
                page_path,
                COUNT(*) as views,
                COUNT(DISTINCT visitor_id) as unique_visitors
            FROM page_views 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY page_path
            ORDER BY views DESC
            LIMIT 10
        '''.format(days))
        
        top_pages = [
            {
                'path': row[0],
                'views': row[1],
                'uniqueVisitors': row[2]
            }
            for row in cursor.fetchall()
        ]
        
        # Get interaction breakdown
        cursor.execute('''
            SELECT 
                action,
                COUNT(*) as count,
                COUNT(DISTINCT visitor_id) as unique_users
            FROM apod_interactions 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY action
            ORDER BY count DESC
        '''.format(days))
        
        interaction_breakdown = {
            row[0]: {'count': row[1], 'uniqueUsers': row[2]}
            for row in cursor.fetchall()
        }
        
        conn.close()
        
        dashboard_data = {
            'overview': {
                'totalUniqueVisitors': cumulative_data['cumulative']['totalUniqueVisitors'],
                'totalPageViews': cumulative_data['cumulative']['totalPageViews'],
                'totalSessions': cumulative_data['cumulative']['totalSessions'],
                'totalInteractions': cumulative_data['cumulative']['totalApodInteractions'],
                'daysSinceLaunch': cumulative_data['cumulative']['daysSinceLaunch']
            },
            'timeRange': f"Last {days} days",
            'dailyBreakdown': daily_breakdown,
            'topPages': top_pages,
            'interactionBreakdown': interaction_breakdown,
            'growth': cumulative_data.get('growth', {}),
            'engagement': cumulative_data.get('engagement', {}),
            'deviceBreakdown': cumulative_data.get('deviceBreakdown', {}),
            'milestones': cumulative_data.get('milestones', {}),
            'dataSource': 'enhanced_local',
            'lastUpdated': datetime.now().isoformat()
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        logger.error(f"Error generating admin dashboard: {e}")
        return jsonify({'error': 'Failed to generate dashboard data'}), 500

# ================================
# UTILITY ENDPOINTS
# ================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with comprehensive analytics status."""
    try:
        # Test database connection
        conn = sqlite3.connect('analytics.db')
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM unique_visitors')
        visitor_count = cursor.fetchone()[0]
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'analytics': {
                'ga4_enabled': analytics_enabled,
                'local_db_status': 'connected',
                'total_visitors_tracked': visitor_count,
                'fingerprints_loaded': len(visitor_fingerprints)
            },
            'cache_status': {
                'apod_cached': apod_cache['data'] is not None,
                'audio_cache_size': len(apod_cache.get('audio_cache', {})),
                'analytics_cache_size': len(analytics_cache)
            },
            'cumulative_stats': cumulative_stats
        })
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all caches (for development/debugging)."""
    try:
        # Clear audio cache files
        audio_cache = apod_cache.get('audio_cache', {})
        for cache_info in audio_cache.values():
            try:
                os.unlink(cache_info['path'])
            except OSError:
                pass
        
        # Reset caches
        apod_cache['data'] = None
        apod_cache['timestamp'] = None
        apod_cache['audio_cache'] = {}
        
        # Clear analytics cache
        analytics_cache.clear()
        
        # Clear LRU cache
        fetch_nasa_apod.cache_clear()
        
        logger.info("All caches cleared successfully")
        return jsonify({'message': 'All caches cleared successfully'})
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return jsonify({'error': 'Failed to clear cache'}), 500

# ================================
# ERROR HANDLERS
# ================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ================================
# MAIN
# ================================

if __name__ == '__main__':
    logger.info("🚀 Starting Aetherion Backend Server with Enhanced Analytics...")
    logger.info(f"📊 Google Analytics 4: {'Enabled' if analytics_enabled else 'Disabled'}")
    logger.info(f"🗄️ Enhanced Local Analytics: Enabled")
    logger.info(f"👥 Total Unique Visitors Tracked: {cumulative_stats['total_unique_visitors']}")
    logger.info(f"📄 Total Page Views: {cumulative_stats['total_page_views']}")
    logger.info(f"🎯 Total Interactions: {cumulative_stats['total_apod_interactions']}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)