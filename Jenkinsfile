pipeline {
    agent { label 'aws'}

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'jenkins', changelog: false, credentialsId: 'github_pass', poll: false, url: 'https://github.com/sumit0166/MS-Backend.git'
            }
        }
        
        
        stage('copy to build folder') {
            steps {
                sh """rsync -av --exclude='@tmp' ${env.WORKSPACE}/ /root/deployed/backend/"""
            }
        }
        
        stage('change dir') {
            steps {
                dir('/root/deployed') {
                    sh returnStdout: true, script: 'docker compose restart backend'
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                cleanWs() // Cleans up the workspace
            }
        }

    }
    
    post {
        always {
            echo 'Pipeline finished'
        }
        failure {
            echo 'Pipeline failed'
        }
    }

}
