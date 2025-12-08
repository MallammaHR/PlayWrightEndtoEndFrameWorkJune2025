// ============================================
// PLAYWRIGHT FULL PIPELINE (WINDOWS FRIENDLY)
// DEV → QA → STAGE → PROD → COMBINED REPORT
// With Slack + Email Notifications
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.cache\\ms-playwright"

        SLACK_WEBHOOK_URL = credentials('slack-webhook-token')
        EMAIL_RECIPIENTS = "mallammahr05@gmail.com"
    }

    stages {

        // ------------------------
        //  DEV TEST SUITE
        // ------------------------
        stage('DEV Tests') {
            steps {
                bat 'npx playwright install chromium'
                bat 'npx playwright test --config=playwright.config.ts --project=dev'

                bat 'if exist allure-results-dev rmdir /s /q allure-results-dev'
                bat 'mkdir allure-results-dev'
                bat 'copy /y allure-results\\* allure-results-dev\\'
            }
        }

        // ------------------------
        //  QA TEST SUITE
        // ------------------------
        stage('QA Tests') {
            steps {
                bat 'npx playwright test --config=playwright.config.ts --project=qa'

                bat 'if exist allure-results-qa rmdir /s /q allure-results-qa'
                bat 'mkdir allure-results-qa'
                bat 'copy /y allure-results\\* allure-results-qa\\'
            }
        }

        // ------------------------
        //  STAGE TEST SUITE
        // ------------------------
        stage('STAGE Tests') {
            steps {
                bat 'npx playwright test --config=playwright.config.ts --project=stage'

                bat 'if exist allure-results-stage rmdir /s /q allure-results-stage'
                bat 'mkdir allure-results-stage'
                bat 'copy /y allure-results\\* allure-results-stage\\'
            }
        }

        // ------------------------
        //  PROD TEST SUITE
        // ------------------------
        stage('PROD Tests') {
            steps {
                bat 'npx playwright test --config=playwright.config.ts --project=prod'

                bat 'if exist allure-results-prod rmdir /s /q allure-results-prod'
                bat 'mkdir allure-results-prod'
                bat 'copy /y allure-results\\* allure-results-prod\\'
            }
        }

        // ------------------------
        //  COMBINED ALLURE REPORT
        // ------------------------
        stage('📈 Combined Allure Report') {
            steps {
                echo "Merging results..."

                bat '''
                    powershell -NoProfile -Command "
                        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue 'allure-results-combined';
                        New-Item -ItemType Directory -Path 'allure-results-combined' -Force | Out-Null;
                        Copy-Item -Recurse -Force 'allure-results-dev\\*' 'allure-results-combined';
                        Copy-Item -Recurse -Force 'allure-results-qa\\*' 'allure-results-combined';
                        Copy-Item -Recurse -Force 'allure-results-stage\\*' 'allure-results-combined';
                        Copy-Item -Recurse -Force 'allure-results-prod\\*' 'allure-results-combined';
                        Set-Content 'allure-results-combined\\environment.properties' 'Environment=ALL'; 
                        Add-Content 'allure-results-combined\\environment.properties' 'Browser=Chrome';
                        Exit 0
                    "
                '''
            }

            post {
                always {
                    bat 'npx allure generate allure-results-combined --clean -o allure-report-combined || echo "allure not installed"'

                    allure([
                        includeProperties: true,
                        reportBuildPolicy: "ALWAYS",
                        results: [[path: "allure-results-combined"]]
                    ])
                }
            }
        }
    }

    // --------------------------------------------
    // POST-BUILD NOTIFICATIONS
    // --------------------------------------------
    post {

        success {
            echo "✔ Pipeline Success"
            slackSend(
                color: "good",
                message: "✔ Playwright Pipeline Passed\nBuild: #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
            )
        }

        failure {
            echo "❌ Pipeline failed!"
            slackSend(
                color: "danger",
                message: "❌ Playwright Pipeline FAILED\nBuild: #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
            )
            emailext(
                subject: "❌ Playwright Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed.\n${env.BUILD_URL}",
                to: env.EMAIL_RECIPIENTS
            )
        }
    }
}
