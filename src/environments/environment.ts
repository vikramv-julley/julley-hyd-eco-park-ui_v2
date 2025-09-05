export const environment = {
  production: false,
  apiUrl: 'http://13.235.31.61:8081',
  //apiUrl: 'http://localhost:8081',
  cognito: {
    userPoolId: 'ap-south-1_l57pOkQZo',
    clientId: '3kqjctb5d33gi872rkip326tbd',
    region: 'ap-south-1',
    domain: 'ap-south-1l57pokqzo.auth.ap-south-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200/callback',
    redirectSignOut: 'http://localhost:4200/',
    responseType: 'code',
    issuerURL: 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_l57pOkQZo'
  }
};
