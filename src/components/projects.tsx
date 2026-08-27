import './Projects.css'

interface Project {
  name: string
  techStack: string[]
  description: string
  links: { label: string; href: string }[]
}

// Swap in real repo URLs when ready — placeholders point nowhere on purpose
const PROJECTS: Project[] = [
  {
    name: 'DevSecOps Three-Tier App on AWS EKS',
    techStack: ['Kubernetes (EKS)', 'Terraform', 'Jenkins', 'ArgoCD', 'SonarQube', 'Trivy', 'Prometheus', 'Grafana'],
    description:
      'Architected a fault-tolerant 3-tier microservices app (React/Node.js/MongoDB) on Amazon EKS, sustaining 1K RPS at sub-250ms P95 latency with 99.9% uptime across 15–30 pods on a multi-node cluster. Full DevSecOps pipeline — Jenkins → SonarQube → Trivy → ArgoCD GitOps — with Prometheus/Grafana observability, entire infra provisioned via Terraform.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'CI/CD Pipeline with Jenkins, SonarQube & Docker',
    techStack: ['Jenkins', 'SonarQube', 'Docker', 'AWS EC2', 'GitHub Webhooks', 'VPC'],
    description:
      'Multi-server CI/CD pipeline across three isolated AWS EC2 instances (Jenkins, SonarQube, Docker), triggered via GitHub webhooks on every push. Enforces a static-analysis quality gate before building and deploying containerized releases, with VPC and security groups configured for controlled inter-instance access.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Local RAG-Based AI Pipeline',
    techStack: ['Python', 'FastAPI', 'ChromaDB', 'Ollama', 'Vector Embeddings', 'Semantic Search'],
    description:
      'A fully local Retrieval-Augmented Generation system with no cloud API dependency — ChromaDB vector search paired with an Ollama-hosted LLM for context-aware querying. Async REST endpoints via FastAPI for document ingestion and semantic retrieval, achieving sub-second local inference latency.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Jarvis — Python Voice Assistant',
    techStack: ['Python', 'Speech Recognition', 'TTS', 'OpenAI API', 'NLP'],
    description:
      'A voice-controlled assistant integrating speech recognition, text-to-speech, and the OpenAI API to automate everyday tasks — playing music, browsing, checking news, holding conversational exchanges. 90–95% command recognition accuracy under 1-second latency across varied voice inputs.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Netflix Data Analytics Dashboard',
    techStack: ['AWS S3', 'Amazon QuickSight', 'Data Visualization', 'SPICE'],
    description:
      "An interactive BI dashboard analyzing Netflix's content catalog, piping raw CSV data from S3 into QuickSight's SPICE in-memory engine for fast querying. 5+ visualizations — release-year trends, genre distribution, title-addition timelines — with cross-filtering for ad-hoc analysis.",
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Docker Containerization & Elastic Beanstalk Deployment',
    techStack: ['Docker', 'Dockerfile', 'AWS Elastic Beanstalk', 'Nginx'],
    description:
      'A custom Dockerfile (Nginx base image + static content) deployed to production via AWS Elastic Beanstalk, letting AWS auto-provision the underlying EC2, load balancer, and autoscaling layer. Diagnosed and resolved a live port-conflict bug before deployment.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Static Website Hosting on Amazon S3',
    techStack: ['AWS S3', 'Static Website Hosting', 'ACL', 'Bucket Policies'],
    description:
      "An S3 bucket configured for fully serverless static website hosting — no compute instance required — serving HTML/image assets directly from object storage. Diagnosed and fixed a 403 Forbidden error from S3's default-private object model via ACL-based public-read configuration.",
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Cloud Security with AWS IAM',
    techStack: ['AWS IAM', 'EC2', 'JSON Policy Documents', 'Least-Privilege Access'],
    description:
      'A least-privilege access model via a custom IAM JSON policy scoping an "intern" user group to development-tagged EC2 resources only, using tag-based Condition blocks while denying tag creation/deletion to prevent privilege-escalation. Validated live: restricted user could stop dev instances but was denied on production.',
    links: [{ label: 'Repo', href: '#' }],
  },
  {
    name: 'Web App Deployment via EC2 + Remote SSH',
    techStack: ['AWS EC2', 'SSH', 'RSA Key Pairs', 'VS Code Remote-SSH', 'Apache Maven', 'Java'],
    description:
      'A Java web application (JSP) deployed entirely through a remote-development workflow — provisioned an EC2 instance, generated RSA key-pair authentication, and connected VS Code directly to the remote filesystem via Remote-SSH. Installed Amazon Corretto and Maven on the instance to scaffold and build remotely.',
    links: [{ label: 'Repo', href: '#' }],
  },
]

function Projects() {
  return (
    <section className="projects" id="work" aria-label="Projects">
      <div className="projects__header">
        <p className="projects__eyebrow">&gt; ls ./projects</p>
        <h2>Selected builds</h2>
      </div>

      <div className="projects__grid">
        {PROJECTS.map((project) => (
          <article className="project-card" key={project.name}>
            <div className="project-card__bar">
              <span className="project-card__dot" />
              <span className="project-card__dot" />
              <span className="project-card__dot" />
              <span className="project-card__path">
                ~/{project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
              </span>
            </div>
            <div className="project-card__body">
              <h3>{project.name}</h3>
              <ul className="project-card__stack">
                {project.techStack.map((tech) => (
                  <li key={tech} className="project-card__tag">
                    {tech}
                  </li>
                ))}
              </ul>
              <p>{project.description}</p>
              <div className="project-card__links">
                {project.links.map((link) => (
                  <a key={link.label} href={link.href} className="project-card__link">
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects