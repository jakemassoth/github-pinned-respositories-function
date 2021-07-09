const functions = require("firebase-functions");
const {graphql} = require("@octokit/graphql");
// DEV ONLY, COMMENT BEFORE DEPLOYING
// const token = require("./secrets");

exports.getPinned = functions.https.onRequest((request, response) => {
  const username = request.query.username;

  const query = `query {
    user(login:"${username}") {
        pinnedItems(first: 6, types: REPOSITORY) {
            totalCount
            edges {
                node {
                    ... on Repository {
                    name
                    description
                    forkCount
                    stargazerCount
                    primaryLanguage {
                      name
                    }
                    url
                    pushedAt
                    }
                }
            }
        }
    }
  }`;

  const graphqlWithAuth = graphql.defaults({
    headers: {
      // PROD ONLY, UNCOMMENT BEFORE DEPLOYING
      authorization: `bearer ${functions.config().github.token}`,
      // DEV ONLY, COMMENT BEFORE DEPLOYING
      // authorization: `bearer ${token.token}`,
    },
  });

  graphqlWithAuth(query)
      .then((res) => {
        functions.logger.info(res.user.pinnedItems.edges);
        response.set("Access-Control-Allow-Origin", "*");
        response.send(res.user.pinnedItems.edges);
      })
      .catch((error) => {
        functions.logger.error(error);
        response.status(500).send(error);
      });
});
