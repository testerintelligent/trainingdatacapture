pipeline {
    agent  { label 'LinuxAgent' }
    environment {
        GIT_REPO_URL = 'https://github.com/testerintelligent/trainingdatacapture.git'
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
                    sh """
                     echo "Down the docker Container" | sudo -S docker-compose down
                     echo "Build and up the docker Container" | sudo docker-compose up --build -d
                    """
                }
            }
        }

        stage('Display URL') {
            steps {
                script {
                    def url = "10.192.190.158:8002"
                    echo "Traning Application is running at ${url}"
                }
            }
        }
    }
}
