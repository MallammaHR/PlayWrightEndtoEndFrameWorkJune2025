pipeline {
    agent any

    environment {
        NODEJS_HOME = "${tool 'NodeJS'}"
        PATH = "${env.NODEJS_HOME}\\bin;${env.PATH}"
        ALLURE_HOME = "C:\\ProgramData\\Allure"
        ALLURE_RESULTS = "allure-results"
        ALLURE_REPORT_DEV = "allure-report-dev"
        ALLURE_REPORT_QA = "allure-report-qa"
        ALLURE_REPORT_STAGE = "allure-report-stage"
        ALLURE_REPORT_PROD = "allure-report-prod"
    }

    stages {

        stage('Checkout') {
            steps {
                bat 'echo Checking out repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('ESLint') {
            steps {
                bat 'npm run lint'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'eslint-report.html', allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //               DEV ENVIRONMENT
        // ---------------------------------------------

        stage('DEV Tests') {
            steps {
                bat 'npx playwright test --project=chromium --reporter=line'
            }
            post {
                always {
                    bat "if exist ${ALLURE_RESULTS} rmdir /s /q ${ALLURE_RESULTS}"
                    bat "mkdir ${ALLURE_RESULTS}"
                    bat "copy /Y test-results\\* ${ALLURE_RESULTS}"

                    bat "\"%ALLURE_HOME%\\bin\\allure\" generate ${ALLURE_RESULTS} -o ${ALLURE_REPORT_DEV} --clean"

                    archiveArtifacts artifacts: "${ALLURE_REPORT_DEV}/**", allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //               QA ENVIRONMENT
        // ---------------------------------------------

        stage('QA Tests') {
            steps {
                bat 'set TEST_ENV=qa && npx playwright test'
            }
            post {
                always {
                    bat "mkdir ${ALLURE_RESULTS}"
                    bat "copy /Y test-results\\* ${ALLURE_RESULTS}"
                    bat "\"%ALLURE_HOME%\\bin\\allure\" generate ${ALLURE_RESULTS} -o ${ALLURE_REPORT_QA} --clean"
                    archiveArtifacts artifacts: "${ALLURE_REPORT_QA}/**", allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //             STAGE ENVIRONMENT
        // ---------------------------------------------

        stage('STAGE Tests') {
            steps {
                bat 'set TEST_ENV=stage && npx playwright test'
            }
            post {
                always {
                    bat "mkdir ${ALLURE_RESULTS}"
                    bat "copy /Y test-results\\* ${ALLURE_RESULTS}"
                    bat "\"%ALLURE_HOME%\\bin\\allure\" generate ${ALLURE_RESULTS} -o ${ALLURE_REPORT_STAGE} --clean"
                    archiveArtifacts artifacts: "${ALLURE_REPORT_STAGE}/**", allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //               PROD ENVIRONMENT
        // ---------------------------------------------

        stage('PROD Tests') {
            steps {
                bat 'set TEST_ENV=prod && npx playwright test'
            }
            post {
                always {
                    bat "mkdir ${ALLURE_RESULTS}"
                    bat "copy /Y test-results\\* ${ALLURE_RESULTS}"
                    bat "\"%ALLURE_HOME%\\bin\\allure\" generate ${ALLURE_RESULTS} -o ${ALLURE_REPORT_PROD} --clean"
                    archiveArtifacts artifacts: "${ALLURE_REPORT_PROD}/**", allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //          COMBINED ALLURE DASHBOARD
        // ---------------------------------------------

        stage('Combined Allure Report') {
            steps {
                bat "\"%ALLURE_HOME%\\bin\\allure\" generate ${ALLURE_REPORT_DEV} ${ALLURE_REPORT_QA} ${ALLURE_REPORT_STAGE} ${ALLURE_REPORT_PROD} -o allure-report-combined --clean"
            }
            post {
                always {
                    archiveArtifacts artifacts: "allure-report-combined/**", allowEmptyArchive: true
                }
            }
        }

        // ---------------------------------------------
        //                SLACK NOTIFICATION
        // ---------------------------------------------

        stage('Slack Notification') {
            steps {
                script {
                    slackSend(
                        channel: '#automation',
                        color: currentBuild.currentResult == 'SUCCESS' ? 'good' : 'danger',
                        message: "Playwright Pipeline Completed: *${currentBuild.currentResult}*\nBuild: ${env.BUILD_URL}"
                    )
                }
            }
        }

        // ---------------------------------------------
        //                 EMAIL REPORT
        // ---------------------------------------------

        stage('Email Report') {
            steps {
                emailext(
                    subject: "Playwright Automation Report - ${currentBuild.currentResult}",
                    body: """
                        <h2>Playwright Automation Summary</h2>
                        <table border="1" cellpadding="7">
                            <tr><th>Environment</th><th>Allure Report</th></tr>
                            <tr><td>DEV</td><td><a href="${env.BUILD_URL}artifact/${ALLURE_REPORT_DEV}/index.html">Open Report</a></td></tr>
                            <tr><td>QA</td><td><a href="${env.BUILD_URL}artifact/${ALLURE_REPORT_QA}/index.html">Open Report</a></td></tr>
                            <tr><td>STAGE</td><td><a href="${env.BUILD_URL}artifact/${ALLURE_REPORT_STAGE}/index.html">Open Report</a></td></tr>
                            <tr><td>PROD</td><td><a href="${env.BUILD_URL}artifact/${ALLURE_REPORT_PROD}/index.html">Open Report</a></td></tr>
                        </table>
                        <br/>
                        <p>Combined Allure Report:</p>
                        <a href="${env.BUILD_URL}artifact/allure-report-combined/index.html">Click Here</a>
                    """,
                    to: "your-email@example.com"
                )
            }
        }
    }
}
