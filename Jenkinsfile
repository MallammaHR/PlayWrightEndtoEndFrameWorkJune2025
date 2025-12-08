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

        // STATUS VARIABLES FOR ALL ENVIRONMENTS
        DEV_EMOJI = ""
        QA_EMOJI = ""
        STAGE_EMOJI = ""
        PROD_EMOJI = ""

        DEV_TEST_STATUS = ""
        QA_TEST_STATUS = ""
        STAGE_TEST_STATUS = ""
        PROD_TEST_STATUS = ""
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
            post {
                success {
                    env.DEV_EMOJI = "✔️"
                    env.DEV_TEST_STATUS = "PASSED"
                }
                failure {
                    env.DEV_EMOJI = "❌"
                    env.DEV_TEST_STATUS = "FAILED"
                }
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
            post {
                success {
                    env.QA_EMOJI = "✔️"
                    env.QA_TEST_STATUS = "PASSED"
                }
                failure {
                    env.QA_EMOJI = "❌"
                    env.QA_TEST_STATUS = "FAILED"
                }
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
            post {
                success {
                    env.STAGE_EMOJI = "✔️"
                    env.STAGE_TEST_STATUS = "PASSED"
                }
                failure {
                    env.STAGE_EMOJI = "❌"
                    env.STAGE_TEST_STATUS = "FAILED"
                }
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
            post {
                success {
                    env.PROD_EMOJI = "✔️"
                    env.PROD_TEST_STATUS = "PASSED"
                }
                failure {
                    env.PROD_EMOJI = "❌"
                    env.PROD_TEST_STATUS = "FAILED"
                }
            }
        }

        // ------------------------
        //  COMBINED ALLURE REPORT
        // ------------------------
        stage('📈 Combined Allure Report') {
            steps {
                echo "Merging Allure results..."

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
                    bat 'npx allure generate allure-results-combined --clean -o allure-report-combined || echo "Allure not installed"'

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
                message: """✔ *Playwright Pipeline Success*

*DEV:* ${env.DEV_EMOJI} ${env.DEV_TEST_STATUS}
*QA:* ${env.QA_EMOJI} ${env.QA_TEST_STATUS}
*STAGE:* ${env.STAGE_EMOJI} ${env.STAGE_TEST_STATUS}
*PROD:* ${env.PROD_EMOJI} ${env.PROD_TEST_STATUS}

🔗 Build: ${env.BUILD_URL}
"""
            )
        }

        failure {
            echo "❌ Pipeline Failed!"

            slackSend(
                color: "danger",
                message: """❌ *Playwright Pipeline FAILED*

*DEV:* ${env.DEV_EMOJI} ${env.DEV_TEST_STATUS}
*QA:* ${env.QA_EMOJI} ${env.QA_TEST_STATUS}
*STAGE:* ${env.STAGE_EMOJI} ${env.STAGE_TEST_STATUS}
*PROD:* ${env.PROD_EMOJI} ${env.PROD_TEST_STATUS}

🔗 Build: ${env.BUILD_URL}
"""
            )

            emailext(
                subject: "❌ Playwright Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<!DOCTYPE html>
<html>
<body>
<h2>Playwright Pipeline FAILED</h2>
<p><b>DEV:</b> ${env.DEV_TEST_STATUS}</p>
<p><b>QA:</b> ${env.QA_TEST_STATUS}</p>
<p><b>STAGE:</b> ${env.STAGE_TEST_STATUS}</p>
<p><b>PROD:</b> ${env.PROD_TEST_STATUS}</p>
<br>
<a href='${env.BUILD_URL}'>View Build</a>
</body>
</html>""",
                mimeType: 'text/html',
                to: env.EMAIL_RECIPIENTS
            )
        }
    }
}
