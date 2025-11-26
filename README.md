# Advana-Marketplace

A React-based marketplace application served with nginx.

## 📚 Documentation

- [Architecture Decision Records (ADRs)](docs/adr/README.md) - Key architectural decisions and their context

## Architecture

This application uses:

- **Frontend**: React with TypeScript, built with Vite
- **Server**: nginx for serving static files
- **Containerization**: Docker with nginx:alpine base image

## Development

### Prerequisites

- Node.js >= 16.17.0
- npm >= 8.0.0
- Docker (for containerized deployment)

### Local Development

#### ECR Login

Pulling containers from ECR is necessary so that the exact containers used in Advana Kubernetes is what is being troubleshot and validated locally

1. Get AWS credentials. There are several ways to do this, but once you log into AWS, click on the link for **access keys** as shown here

   ![Access Keys](imgs/accesskeys.jpg)

1. Next, you can choose any way to get your credentials, in this example, I added the credentials shown to my ~/.aws/config file

   ![SSO Options](imgs/ssooptions.jpg)

1. Now login to ECR

   ```bash
   aws ecr get-login-password --region us-gov-west-1 --profile SandboxDevAccess-092548256278 | docker login --username AWS --password-stdin 231388672283.dkr.ecr.us-gov-west-1.amazonaws.com
   ```

1. Try to pull the node image

   ```bash
   docker pull 231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22
   ```

1. **Install dependencies and start development server:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

1. **Build for production:**

   ```bash
   npm run build
   ```

1. **Preview production build locally:**

   ```bash
   npm run preview
   ```

### Docker Deployment

1. **Build the Docker image:**

   ```bash
   docker build -t advana-marketplace .
   ```

1. **Run the container:**

   ```bash
   docker run -p 8080:8080 advana-marketplace
   ```

1. **Access the application:**

   Open <http://localhost:8080> in your browser


### Available Scripts

From the root directory:

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

### Code Quality & Analysis

#### SonarQube Analysis

This project uses SonarQube for code quality and security analysis.

**Quick Start:**

```bash
# Setup (first time only)
source .env.sonar

# Run analysis
cd frontend
npm run sonar
```

**Available Commands:**

- `npm run sonar` - Full analysis (runs tests + coverage + scan)
- `npm run sonar:quick` - Quick scan only (requires existing coverage)

📖 **[Complete SonarQube Setup Guide](./SONARQUBE_COMPLETE_GUIDE.md)** - Comprehensive documentation for setup, configuration, and troubleshooting.

**View Results:** [SonarQube Dashboard](https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace)

#### Testing & Coverage

- `npm run test` - Run all tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:a11y` - Run accessibility tests
- `npm run lint` - Run ESLint

### Project Structure

```text
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── styles/     # SCSS styles
│   ├── public/         # Static assets
│   └── dist/           # Build output
├── nginx.conf          # nginx configuration
├── Dockerfile          # Container definition
└── chart/              # Kubernetes Helm chart
```

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```bash
cd existing_repo
git remote add origin https://code.cdao.us/tenant/metrostar/advana-marketplace.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://code.cdao.us/tenant/metrostar/advana-marketplace/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

---

## Contributing

For information on how to contribute to this project, please contact the Marketplace Engineering team.
