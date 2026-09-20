pipeline {
    agent  { label 'LinuxAgent' }
    environment {
        GIT_REPO_URL = 'https://github.com/testerintelligent/trainingdatacapture.git'
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['prod', 'dev'],   // first value = default, so prod is default
            description: 'Select the deployment environment'
        )
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${env.GIT_REPO_URL}"
            }
        }

        stage('Build and Run Containers') {
            steps {
                script {
                    // Map the Jenkins choice ('dev'/'prod') to the NODE_ENV value
                    // that back-end/index.js expects ('development'/'production'),
                    // which selects .env.development or .env.production.
                    def nodeEnv = params.ENVIRONMENT == 'dev' ? 'development' : 'production'
                    echo "Deploying with NODE_ENV=${nodeEnv}"
                    sh """
                     echo "Down the docker Container" | sudo -S docker compose down
                     echo "Build and up the docker Container" | sudo -S NODE_ENV=${nodeEnv} docker compose up --build -d
                    """
                }
            }
        }

        stage('Display URL') {
            steps {
                script {
                    def url = params.ENVIRONMENT == 'dev' ? '127.0.0.1:8002' : '10.192.190.158:8002'
                    echo "Traning Application is running at ${url}"
                }
            }
        }

        stage('Insert Data') {
            steps {
                script {
                    // Back-end API port (5002) is host-mapped the same way as
                    // the frontend's 8002 in docker-compose.yml, on the same host.
                    def apiHost = params.ENVIRONMENT == 'dev' ? '127.0.0.1:5002' : '10.192.190.158:5002'
                    echo "Seeding sample training and candidate data via API_BASE_URL=http://${apiHost}"
                    sh """
                     cd testing
                     npm install
                     API_BASE_URL=http://${apiHost} npm run seed
                    """
                }
            }
        }
    }
}
