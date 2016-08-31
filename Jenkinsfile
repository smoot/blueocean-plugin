pipeline {
  agent docker:'cloudbees/java-build-tools'
  stages {
    stage ('build') {
      //deleteDir
      sh "mvn clean install -B -DcleanNode -Dmaven.test.failure.ignore"
      sh "node checkdeps.js"
    }
  }

  postBuild {
    always {
      junit "**/target/surefire-reports/TEST-*.xml"
      archive "*/target/*.hpi"
      //deleteDir
    }
  }

  environment {
    GIT_COMMITTER_EMAIL="me@hatescake.com"
    GIT_COMMITTER_NAME="Hates"
    GIT_AUTHOR_NAME="Cake"
    GIT_AUTHOR_EMAIL="hates@cake.com"
  }
}
