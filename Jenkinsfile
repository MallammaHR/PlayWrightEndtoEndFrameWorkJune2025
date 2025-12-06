
// ============================================
// PLAYWRIGHT AUTO PIPELINE - JENKINSFILE
// ============================================
// Flow: lint → dev → qa → stage → prod (automatic)
// Trigger: Push, PR, or manual build
// Reports: Separate Allure per environment, Playwright HTML, Custom HTML
// ✅ ESLint static code analysis
// ✅ Separate Allure reports per environment
// ✅ Slack notifications for test results
// ✅ Email notifications with all report links
// ============================================
//
// Required Jenkins Credentials:
// ------------------------------------
// slack-token          - Slack Webhook Token (Secret text)
// ============================================
//
// Required Jenkins Plugins:
// ------------------------------------
// - NodeJS Plugin
// - Allure Jenkins Plugin
// - HTML Publisher Plugin
// - Slack Notification Plugin
// - Email Extension Plugin
// - Pipeline Stage View Plugin
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        NODE_VERSION = '20'
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.cache/ms-playwright"
        SLACK_WEBHOOK_URL = credentials('SLACK_WEBHOOK_SECRET')
        // Email recipients - update these with your actual email addresses
        EMAIL_RECIPIENTS = 'mallammahr05@gmail.com'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        // ============================================
        // Static Code Analysis (ESLint)
        // ============================================
        stage('🔍 ESLint Analysis') {
            steps {
                echo '============================================'
                echo '📥 Installing dependencies...'
                echo '============================================'
                sh 'npm ci'

                echo '============================================'
                echo '📁 Creating ESLint report directory...'
                echo '============================================'
                sh 'mkdir -p eslint-report'

                echo '============================================'
                echo '🔍 Running ESLint...'
                echo '============================================'
                script {
                    def eslintStatus = sh(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '📊 Generating ESLint HTML Report...'
                echo '============================================'
                sh 'npm run lint:report || true'
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'eslint-report',
                        reportFiles: 'index.html',
                        reportName: 'ESLint Report',
                        reportTitles: 'ESLint Analysis'
                    ])
                    script {
                        if (env.ESLINT_STATUS == 'failure') {
                            echo '⚠️ ESLint found issues - check the HTML report'
                        } else {
                            echo '✅ No ESLint issues found'
                        }
                    }
                }
            }
        }

        // ============================================
        // DEV Environment Tests
        // ============================================
        stage('🔧 DEV Tests') {
            steps {
                echo '============================================'
                echo '🎭 Installing Playwright browsers...'
                echo '============================================'
                sh 'npx playwright install --with-deps chromium'

                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running DEV tests...'
                echo '============================================'
                script {
                    env.DEV_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=DEV" > allure-results/environment.properties
                    echo "Browser=Google Chrome" >> allure-results/environment.properties
                    echo "Config=playwright.config.dev.ts" >> allure-results/environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate DEV Allure Report
                    sh '''
                        mkdir -p allure-results-dev
                        cp -r allure-results/* allure-results-dev/ 2>/dev/null || true
                        npx allure generate allure-results-dev --clean -o allure-report-dev || true
                    '''

                    // Publish DEV Allure HTML Report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-dev',
                        reportFiles: 'index.html',
                        reportName: 'DEV Allure Report',
                        reportTitles: 'DEV Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'DEV Playwright Report',
                        reportTitles: 'DEV Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'DEV HTML Report',
                        reportTitles: 'DEV Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-dev/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // QA Environment Tests
        // ============================================
        stage('🔍 QA Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running QA tests...'
                echo '============================================'
                script {
                    env.QA_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.qa.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=QA" > allure-results/environment.properties
                    echo "Browser=Google Chrome" >> allure-results/environment.properties
                    echo "Config=playwright.config.qa.ts" >> allure-results/environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate QA Allure Report
                    sh '''
                        mkdir -p allure-results-qa
                        cp -r allure-results/* allure-results-qa/ 2>/dev/null || true
                        npx allure generate allure-results-qa --clean -o allure-report-qa || true
                    '''

                    // Publish QA Allure HTML Report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-qa',
                        reportFiles: 'index.html',
                        reportName: 'QA Allure Report',
                        reportTitles: 'QA Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'QA Playwright Report',
                        reportTitles: 'QA Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'QA HTML Report',
                        reportTitles: 'QA Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-qa/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // STAGE Environment Tests
        // ============================================
        stage('🎯 STAGE Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running STAGE tests...'
                echo '============================================'
                script {
                    env.STAGE_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.stage.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=STAGE" > allure-results/environment.properties
                    echo "Browser=Google Chrome" >> allure-results/environment.properties
                    echo "Config=playwright.config.stage.ts" >> allure-results/environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate STAGE Allure Report
                    sh '''
                        mkdir -p allure-results-stage
                        cp -r allure-results/* allure-results-stage/ 2>/dev/null || true
                        npx allure generate allure-results-stage --clean -o allure-report-stage || true
                    '''

                    // Publish STAGE Allure HTML Report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-stage',
                        reportFiles: 'index.html',
                        reportName: 'STAGE Allure Report',
                        reportTitles: 'STAGE Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'STAGE Playwright Report',
                        reportTitles: 'STAGE Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'STAGE HTML Report',
                        reportTitles: 'STAGE Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-stage/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // PROD Environment Tests
        // ============================================
        stage('🚀 PROD Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running PROD tests...'
                echo '============================================'
                script {
                    env.PROD_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.prod.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=PROD" > allure-results/environment.properties
                    echo "Browser=Google Chrome" >> allure-results/environment.properties
                    echo "Config=playwright.config.prod.ts" >> allure-results/environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate PROD Allure Report
                    sh '''
                        mkdir -p allure-results-prod
                        cp -r allure-results/* allure-results-prod/ 2>/dev/null || true
                        npx allure generate allure-results-prod --clean -o allure-report-prod || true
                    '''

                    // Publish PROD Allure HTML Report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-prod',
                        reportFiles: 'index.html',
                        reportName: 'PROD Allure Report',
                        reportTitles: 'PROD Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PROD Playwright Report',
                        reportTitles: 'PROD Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'PROD HTML Report',
                        reportTitles: 'PROD Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-prod/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // Generate Combined Allure Report (All Environments)
        // ============================================
        stage('📈 Combined Allure Report') {
            steps {
                echo '============================================'
                echo '📊 Generating Combined Allure Report...'
                echo '============================================'

                sh '''
                    # Create combined results directory
                    mkdir -p allure-results-combined
                    
                    # Copy all environment results
                    cp -r allure-results-dev/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-qa/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-stage/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-prod/* allure-results-combined/ 2>/dev/null || true
                    
                    # Create combined environment.properties
                    echo "Environment=ALL (DEV, QA, STAGE, PROD)" > allure-results-combined/environment.properties
                    echo "Browser=Google Chrome" >> allure-results-combined/environment.properties
                    echo "Pipeline=${JOB_NAME}" >> allure-results-combined/environment.properties
                    echo "Build=${BUILD_NUMBER}" >> allure-results-combined/environment.properties
                '''
            }
            post {
                always {
                    // Generate Combined Allure Report using Allure Jenkins Plugin
                    allure([
                        includeProperties: true,
                        jdk: '',
                        properties: [],
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'allure-results-combined']]
                    ])
                }
            }
        }
    }

    // ============================================
    // Post-Build Actions (Notifications)
    // ============================================
       // ============================================
    // Post-Build Actions (Notifications) - REPLACEMENT
    // ============================================
    post {
        always {
            echo '============================================'
            echo '📬 PIPELINE SUMMARY'
            echo '============================================'

            script {
                def devStatus = env.DEV_TEST_STATUS ?: 'unknown'
                def qaStatus = env.QA_TEST_STATUS ?: 'unknown'
                def stageStatus = env.STAGE_TEST_STATUS ?: 'unknown'
                def prodStatus = env.PROD_TEST_STATUS ?: 'unknown'

                def devEmoji = devStatus == 'success' ? '✅' : '❌'
                def qaEmoji = qaStatus == 'success' ? '✅' : '❌'
                def stageEmoji = stageStatus == 'success' ? '✅' : '❌'
                def prodEmoji = prodStatus == 'success' ? '✅' : '❌'

                echo """
============================================
📊 Test Results by Environment:
============================================
${devEmoji} DEV:   ${devStatus}
${qaEmoji} QA:    ${qaStatus}
${stageEmoji} STAGE: ${stageStatus}
${prodEmoji} PROD:  ${prodStatus}
============================================
"""

                def overallStatus = 'SUCCESS'
                def statusEmoji = '✅'
                def statusColor = 'good'

                if (devStatus == 'failure' || qaStatus == 'failure' || stageStatus == 'failure' || prodStatus == 'failure') {
                    overallStatus = 'FAILURE'
                    statusEmoji = '❌'
                    statusColor = 'danger'
                } else if (devStatus == 'unknown' || qaStatus == 'unknown' || stageStatus == 'unknown' || prodStatus == 'unknown') {
                    overallStatus = 'UNSTABLE'
                    statusEmoji = '⚠️'
                    statusColor = 'warning'
                }

                env.OVERALL_STATUS = overallStatus
                env.STATUS_EMOJI = statusEmoji
                env.STATUS_COLOR = statusColor
                env.DEV_EMOJI = devEmoji
                env.QA_EMOJI = qaEmoji
                env.STAGE_EMOJI = stageEmoji
                env.PROD_EMOJI = prodEmoji
            }
        }

        success {
            echo '✅ Pipeline completed successfully!'

            // Send webhook (platform-aware)
            script {
                withCredentials([string(credentialsId: 'SLACK_WEBHOOK_SECRET', variable: 'WEBHOOK')]) {
                    def payload = """{"text":"✅ Playwright Pipeline: All Tests Passed\\nRepository: ${env.JOB_NAME}\\nBuild: #${env.BUILD_NUMBER}\\n${env.BUILD_URL}"}"""
                    if (isUnix()) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' --data '${payload}' '$WEBHOOK' || true
                        """
                    } else {
                        // Windows (Jenkins node)
                        bat """
                            powershell -Command ^
                              Invoke-RestMethod -Uri '%WEBHOOK%' -Method Post -ContentType 'application/json' -Body '${payload}' || exit 0
                        """
                    }
                }
            }

            // Email (kept as-is)
            script {
                try {
                    emailext(
                        subject: "✅ Playwright Tests Passed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: /* your long HTML body (kept unchanged) */ """ ... """,
                        mimeType: 'text/html',
                        to: env.EMAIL_RECIPIENTS,
                        from: 'CI Notifications <mail@naveenautomationlabs.com>',
                        replyTo: 'mail@naveenautomationlabs.com'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Pipeline failed!'

            // Send webhook (platform-aware)
            script {
                withCredentials([string(credentialsId: 'SLACK_WEBHOOK_SECRET', variable: 'WEBHOOK')]) {
                    def payload = """{"text":"❌ Playwright Pipeline: Tests Failed\\nRepository: ${env.JOB_NAME}\\nBuild: #${env.BUILD_NUMBER}\\n${env.BUILD_URL}"}"""
                    if (isUnix()) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' --data '${payload}' '$WEBHOOK' || true
                        """
                    } else {
                        bat """
                            powershell -Command ^
                              Invoke-RestMethod -Uri '%WEBHOOK%' -Method Post -ContentType 'application/json' -Body '${payload}' || exit 0
                        """
                    }
                }
            }

            // Email for failure (kept as-is)
            script {
                try {
                    emailext(
                        subject: "❌ Playwright Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: /* your long HTML body (kept unchanged) */ """ ... """,
                        mimeType: 'text/html',
                        to: env.EMAIL_RECIPIENTS,
                        from: 'CI Notifications <mail@naveenautomationlabs.com>',
                        replyTo: 'mail@naveenautomationlabs.com'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }

        unstable {
            echo '⚠️ Pipeline completed with warnings!'

            script {
                withCredentials([string(credentialsId: 'SLACK_WEBHOOK_SECRET', variable: 'WEBHOOK')]) {
                    def payload = """{"text":"⚠️ Playwright Pipeline: Unstable\\nRepository: ${env.JOB_NAME}\\nBuild: #${env.BUILD_NUMBER}\\n${env.BUILD_URL}"}"""
                    if (isUnix()) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' --data '${payload}' '$WEBHOOK' || true
                        """
                    } else {
                        bat """
                            powershell -Command ^
                              Invoke-RestMethod -Uri '%WEBHOOK%' -Method Post -ContentType 'application/json' -Body '${payload}' || exit 0
                        """
                    }
                }
            }
        }
    }
