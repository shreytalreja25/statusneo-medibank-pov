// Small shared building blocks.
const BASE = import.meta.env.BASE_URL
export const asset = (p) => `${BASE}${p.replace(/^\//, '')}`

const LOGO_FILE = { kafka: 'kafka.svg', kafkamark: 'kafkamark.svg', debezium: 'debezium.svg', opa: 'opa.png' }
const LOGO_NAME = {
  anthropic: 'Anthropic', claude: 'Claude', googlecloud: 'Google Cloud', gemini: 'Gemini', kafkamark: 'Kafka', kafka: 'Kafka',
  flink: 'Flink', neo4j: 'Neo4j', databricks: 'Databricks', kubernetes: 'Kubernetes', opentelemetry: 'OpenTelemetry',
  grafana: 'Grafana', langchain: 'LangChain', langgraph: 'LangGraph', qdrant: 'Qdrant', snowflake: 'Snowflake',
  terraform: 'Terraform', fastapi: 'FastAPI', pytorch: 'PyTorch', mlflow: 'MLflow', redis: 'Redis', postgresql: 'PostgreSQL',
  elasticsearch: 'Elasticsearch', elastic: 'Elastic', huggingface: 'Hugging Face', mcp: 'MCP', react: 'React', typescript: 'TypeScript',
  github: 'GitHub', aws: 'AWS', azure: 'Azure', debezium: 'Debezium', opa: 'Open Policy Agent', spark: 'Spark',
  python: 'Python', backstage: 'Backstage', playwright: 'Playwright', java: 'Java', datadog: 'Datadog', jira: 'Jira',
  splunk: 'Splunk', googlecloud: 'Google Cloud', prometheus: 'Prometheus', docker: 'Docker', pagerduty: 'PagerDuty', salesforce: 'Salesforce',
}
export const techName = (k) => LOGO_NAME[k] || k

export function TechLogo({ k, h = 18, className = '' }) {
  return <img className={`tlogo ${className}`} src={asset(`tech/${LOGO_FILE[k] || `${k}.svg`}`)} alt={techName(k)} title={techName(k)} style={{ height: h }} loading="lazy" />
}

export function SNLogo({ white = false, h = 24 }) {
  return <img src={asset(`brand/statusneo${white ? '-white' : ''}.svg`)} alt="StatusNeo" style={{ height: h, width: 'auto' }} />
}

// Official Medibank wordmark
export function MedibankLogo({ h = 22 }) {
  return <img src={asset('brand/medibank.png')} alt="Medibank" style={{ height: h, width: 'auto' }} />
}

// The blue "i" from the Medibank wordmark, used as a small marker
export function MedibankI({ size = 22, className = '' }) {
  return <img className={className} src={asset('brand/medibank-i.png')} alt="" aria-hidden="true" style={{ height: size, width: 'auto' }} />
}
