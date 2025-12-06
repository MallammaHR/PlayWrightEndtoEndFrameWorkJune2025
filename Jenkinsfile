// Full, cleaned Jenkinsfile - Option 1 (Full Pipeline)

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        NODE_VERSION = '20'
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.cache/ms-playwright"
        // Keep or remove SLACK_WEBHOOK_URL here as you prefer - Jenkins UI Override URL will be used by slackSend
        SLACK_WEBHOOK_URL = credentials('slack-webhook-token') // optional, not required if using Override URL in Jenkins UI
        EMAIL_RECIPIENTS = 'naveenanimation20@gmail.com, submit@naveenautomationlabs.com'
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
                echo '📥 Installing dependencies...'
                sh 'npm ci'

                echo '📁 Creating ESLint report directory...'
                sh 'mkdir -p eslint-report || true'

                echo '🔍 Running ESLint...'
                script {
                    def eslintStatus = sh(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '📊 Generating ESLint HTML Report...'
                // your project should have a lint:report script that writes eslint-report/index.html
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
                        reportName: 'ESLint_Report',
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
                echo '🎭 Installing Playwright browsers (chromium)...'
                sh 'npx playwright install --with-deps chromium || true'

                echo '🧹 Cleaning previous results...'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results || true'

                echo '🧪 Running DEV tests...'
                script {
                    env.DEV_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '🏷️ Adding Allure environment info for DEV...'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=DEV" > allure-results/environment.properties || true
                    echo "Browser=Google Chrome" >> allure-results/environment.properties || true
                    echo "Config=playwright.config.dev.ts" >> allure-results/environment.properties || true
                '''
            }
            post {
                always {
                    // Copy & generate DEV Allure Report
                    sh '''
                        mkdir -p allure-results-dev || true
                        cp -r allure-results/* allure-results-dev/ 2>/dev/null || true
                        npx allure generate allure-results-dev --clean -o allure-report-dev || true
                    '''

                    // Ensure Playwright HTML report folder name copies (if built)
                    sh '''
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-report-dev || true
                        fi
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-html-report-dev || true
                        fi
                    '''

                    // Publish DEV Allure & Playwright Reports (unique report names)
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-dev',
                        reportFiles: 'index.html',
                        reportName: 'DEV_Allure_Report',
                        reportTitles: 'DEV Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report-dev',
                        reportFiles: 'index.html',
                        reportName: 'DEV_Playwright_Report',
                        reportTitles: 'DEV Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report-dev',
                        reportFiles: 'index.html',
                        reportName: 'DEV_HTML_Report',
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
                echo '🧹 Cleaning previous results...'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results || true'

                echo '🧪 Running QA tests...'
                script {
                    env.QA_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.qa.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '🏷️ Adding Allure environment info for QA...'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=QA" > allure-results/environment.properties || true
                    echo "Browser=Google Chrome" >> allure-results/environment.properties || true
                    echo "Config=playwright.config.qa.ts" >> allure-results/environment.properties || true
                '''
            }
            post {
                always {
                    sh '''
                        mkdir -p allure-results-qa || true
                        cp -r allure-results/* allure-results-qa/ 2>/dev/null || true
                        npx allure generate allure-results-qa --clean -o allure-report-qa || true
                    '''

                    sh '''
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-report-qa || true
                        fi
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-html-report-qa || true
                        fi
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-qa',
                        reportFiles: 'index.html',
                        reportName: 'QA_Allure_Report',
                        reportTitles: 'QA Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report-qa',
                        reportFiles: 'index.html',
                        reportName: 'QA_Playwright_Report',
                        reportTitles: 'QA Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report-qa',
                        reportFiles: 'index.html',
                        reportName: 'QA_HTML_Report',
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
                echo '🧹 Cleaning previous results...'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results || true'

                echo '🧪 Running STAGE tests...'
                script {
                    env.STAGE_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.stage.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '🏷️ Adding Allure environment info for STAGE...'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=STAGE" > allure-results/environment.properties || true
                    echo "Browser=Google Chrome" >> allure-results/environment.properties || true
                    echo "Config=playwright.config.stage.ts" >> allure-results/environment.properties || true
                '''
            }
            post {
                always {
                    sh '''
                        mkdir -p allure-results-stage || true
                        cp -r allure-results/* allure-results-stage/ 2>/dev/null || true
                        npx allure generate allure-results-stage --clean -o allure-report-stage || true
                    '''

                    sh '''
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-report-stage || true
                        fi
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-html-report-stage || true
                        fi
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-stage',
                        reportFiles: 'index.html',
                        reportName: 'STAGE_Allure_Report',
                        reportTitles: 'STAGE Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report-stage',
                        reportFiles: 'index.html',
                        reportName: 'STAGE_Playwright_Report',
                        reportTitles: 'STAGE Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report-stage',
                        reportFiles: 'index.html',
                        reportName: 'STAGE_HTML_Report',
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
                echo '🧹 Cleaning previous results...'
                sh 'rm -rf allure-results playwright-report playwright-html-report test-results || true'

                echo '🧪 Running PROD tests...'
                script {
                    env.PROD_TEST_STATUS = sh(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.prod.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '🏷️ Adding Allure environment info for PROD...'
                sh '''
                    mkdir -p allure-results
                    echo "Environment=PROD" > allure-results/environment.properties || true
                    echo "Browser=Google Chrome" >> allure-results/environment.properties || true
                    echo "Config=playwright.config.prod.ts" >> allure-results/environment.properties || true
                '''
            }
            post {
                always {
                    sh '''
                        mkdir -p allure-results-prod || true
                        cp -r allure-results/* allure-results-prod/ 2>/dev/null || true
                        npx allure generate allure-results-prod --clean -o allure-report-prod || true
                    '''

                    sh '''
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-report-prod || true
                        fi
                        if [ -d "playwright-report" ]; then
                          cp -r playwright-report playwright-html-report-prod || true
                        fi
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-prod',
                        reportFiles: 'index.html',
                        reportName: 'PROD_Allure_Report',
                        reportTitles: 'PROD Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report-prod',
                        reportFiles: 'index.html',
                        reportName: 'PROD_Playwright_Report',
                        reportTitles: 'PROD Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report-prod',
                        reportFiles: 'index.html',
                        reportName: 'PROD_HTML_Report',
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
                echo '📊 Generating Combined Allure Report...'
                sh '''
                    mkdir -p allure-results-combined || true
                    cp -r allure-results-dev/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-qa/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-stage/* allure-results-combined/ 2>/dev/null || true
                    cp -r allure-results-prod/* allure-results-combined/ 2>/dev/null || true
                    echo "Environment=ALL (DEV, QA, STAGE, PROD)" > allure-results-combined/environment.properties || true
                    echo "Browser=Google Chrome" >> allure-results-combined/environment.properties || true
                    echo "Pipeline=${JOB_NAME}" >> allure-results-combined/environment.properties || true
                    echo "Build=${BUILD_NUMBER}" >> allure-results-combined/environment.properties || true
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

                    // Also publish combined HTML if generated by Allure plugin to keep consistency
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-combined',
                        reportFiles: 'index.html',
                        reportName: 'ALLURE_Combined_Report',
                        reportTitles: 'Combined Allure Report'
                    ])
                }
            }
        }
    }

    // ============================================
    // Post-Build Actions (Notifications & final reports)
    // ============================================
    post {
        always {
            echo '📬 PIPELINE SUMMARY'

            script {
                def devStatus = env.DEV_TEST_STATUS ?: 'unknown'
                def qaStatus = env.QA_TEST_STATUS ?: 'unknown'
                def stageStatus = env.STAGE_TEST_STATUS ?: 'unknown'
                def prodStatus = env.PROD_TEST_STATUS ?: 'unknown'

                def devEmoji = devStatus == 'success' ? '✅' : '❌'
                def qaEmoji = qaStatus == 'success' ? '✅' : '❌'
                def stageEmoji = stageStatus == 'success' ? '✅' : '❌'
                def prodEmoji = prodStatus == 'success' ? '✅' : '❌'

                env.OVERALL_STATUS = (devStatus == 'failure' || qaStatus == 'failure' || stageStatus == 'failure' || prodStatus == 'failure') ? 'FAILURE' : 'SUCCESS'
                env.STATUS_COLOR = env.OVERALL_STATUS == 'FAILURE' ? 'danger' : 'good'

                echo """
📊 Test Results by Environment:
${devEmoji} DEV:   ${devStatus}
${qaEmoji} QA:    ${qaStatus}
${stageEmoji} STAGE: ${stageStatus}
${prodEmoji} PROD:  ${prodStatus}
"""
            }
        }

        success {
            echo '✅ Pipeline completed successfully!'
            script {
                try {
                    slackSend(
                        color: 'good',
                        message: """✅ *Playwright Pipeline: All Tests Passed*
*Repository:* ${env.JOB_NAME}
*Branch:* ${env.GIT_BRANCH ?: 'N/A'}
*Build:* #${env.BUILD_NUMBER}

*Test Results:*
${env.DEV_EMOJI ?: '✅'} DEV: ${env.DEV_TEST_STATUS}
${env.QA_EMOJI ?: '✅'} QA: ${env.QA_TEST_STATUS}
${env.STAGE_EMOJI ?: '✅'} STAGE: ${env.STAGE_TEST_STATUS}
${env.PROD_EMOJI ?: '✅'} PROD: ${env.PROD_TEST_STATUS}

📊 Combined Allure: ${env.BUILD_URL}allure
🔗 View Build: ${env.BUILD_URL}
"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }

                // Email notification
                try {
                    emailext(
                        subject: "✅ Playwright Tests Passed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: "Playwright pipeline succeeded. Build: ${env.BUILD_URL}",
                        to: env.EMAIL_RECIPIENTS
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }

        unstable {
            echo '⚠️ Pipeline completed with warnings!'
            script {
                try {
                    slackSend(
                        color: 'warning',
                        message: """⚠️ *Playwright Pipeline: Unstable*
*Repository:* ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
🔗 ${env.BUILD_URL}
"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Pipeline failed!'
            script {
                try {
                    slackSend(
                        channel: '#test_automation1',
                        color: 'danger',
                        tokenCredentialId: 'SLACK_WEBHOOK_SECRET',
                        message: """❌ *Playwright Pipeline: Tests Failed*
*Repository:* ${env.JOB_NAME}
*Build:* #${env.BUILD_NUMBER}
🔗 ${env.BUILD_URL}
"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }

                try {
                    emailext(
                        subject: "❌ Playwright Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: "Playwright pipeline failed. Build: ${env.BUILD_URL}",
                        to: env.EMAIL_RECIPIENTS
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
    }
}
