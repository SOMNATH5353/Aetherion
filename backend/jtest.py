from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/service-account.json"

client = BetaAnalyticsDataClient()

request = RunRealtimeReportRequest(
    property="properties/YOUR_GA4_PROPERTY_ID",
    metrics=[Metric(name="activeUsers")],
)

response = client.run_realtime_report(request)
print("✅ It works. Active Users:", response.rows[0].metric_values[0].value)
