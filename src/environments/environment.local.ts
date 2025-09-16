const hostname = 'http://localhost:4200'; // CloudFront endpoint for non-prod
export const environment = {
    signedURLEndPoint: hostname + '/ghg/signed-url', // URL to get signed URL for S3 uploads
    userProfileAuth: hostname + '/ghg/userProfile',
    hostname: hostname,
    env: 'local',
    production: false,
    enableAuthorization: false,
    logoutURL: 'https://dev-76635844.okta.com',
    clientId: '0oaqk3zsoe7NvrT4C5d7',
    redirectUri: 'http://localhost:4200',
    storageKey: 'oktaAccessToken',
    oktaBaseUrl: 'https://dev-76635844.okta.com',
    authServerId: 'default',
    users: 'https://nz0ly112ua.execute-api.us-east-1.amazonaws.com/ghg/users',
    userRoles: 'https://5p8w07va0f.execute-api.us-east-1.amazonaws.com/user_roles',
    apiBaseUrl: 'https://hwdengjrh9.execute-api.us-east-1.amazonaws.com/ghg'
};