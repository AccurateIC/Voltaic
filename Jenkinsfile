pipeline {
    agent any

    tools {
        nodejs "NodeJs22.17.0"
    }

    // 🔹 Replaced githubPush() with Poll SCM
    triggers {
        pollSCM('H/5 * * * *')  // Check every 5 min for changes
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    url: 'https://github.com/AccurateIC/Neurogen_Web.git',
                    credentialsId: 'jenkinsKey'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'pnpm install'
            }
        }

        stage('Setup .env files') {
            steps {
                withCredentials([file(credentialsId: 'backend-env', variable: 'BACKEND_ENV_FILE')]) {
                    sh 'cp "$BACKEND_ENV_FILE" "$WORKSPACE/apps/backend/.env"'
                }
                withCredentials([file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV_FILE')]) {
                    sh 'cp "$FRONTEND_ENV_FILE" "$WORKSPACE/apps/frontend/.env"'
                }
                sh 'echo ".env files copied successfully"'
            }
        }

        stage('Build Apps') {
            steps {
                sh 'pnpm build'
                sh 'sudo chown -R jenkins:jenkins "$WORKSPACE/apps/backend/build"'
                sh 'sudo chown -R jenkins:jenkins "$WORKSPACE/apps/frontend/build"'
            }
        }

        stage('Deploy to Local Server') {
            steps {
                sh 'pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js'
                sh 'pm2 save'
            }
        }
    }
}
