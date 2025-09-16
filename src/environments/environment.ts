const hostname = 'https://d1vnyczfdg3qxo.cloudfront.net'; // CloudFront endpoint for non-prod
export const environment = {
  signedURLEndPoint: hostname + '/ghg/signed-url', // URL to get signed URL for S3 uploads
  userProfileAuth: hostname + '/ghg/userProfile',
  hostname: hostname,
  env: 'dev',
  production: false,
  enableAuthorization: false,
  logoutURL: 'https://purolator.okta.com',
  clientId: '0oa22jpxggb0fZkON0h8',
  redirectUri: 'http://localhost:4200',
  storageKey: 'oktaAccessToken',
  oktaBaseUrl: 'https://purolator.okta.com',
  users: 'https://e6n2070drc.execute-api.us-east-1.amazonaws.com/users/ghg',
  userRoles: 'https://5p8w07va0f.execute-api.us-east-1.amazonaws.com/user_roles',
  apiBaseUrl: 'https://hwdengjrh9.execute-api.us-east-1.amazonaws.com/ghg'
};
