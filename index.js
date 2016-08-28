const appModule = require("application");
var utils = require("utils/utils");

const socialLogin = {};
var fbCallbackManager = null;
const GOOGLE_SIGNIN_INTENT_ID = 123;
const LoginType = {
    GOOGLE: 0,
    FACEBOOK: 1
};

function toLoginResult(user) {
    return {
        token: user.token
    };
}


socialLogin.init = function(type) {
    // initialize facebook
    if (typeof(com.facebook) !== "undefined") {
        com.facebook.FacebookSdk.sdkInitialize(appModule.android.context);
        fbCallbackManager = com.facebook.CallbackManager.Factory.create();

        appModule.android.on(appModule.AndroidApplication.activityResultEvent, function(eventData){
            if (eventData.requestCode !== GOOGLE_SIGNIN_INTENT_ID) {
                fbCallbackManager.onActivityResult(eventData.requestCode, eventData.resultCode, eventData.intent);
            }
        });
    }
};

/**
 *
 * @param arg
 *      type = socialLogin.LoginType.GOOGLE | socialLogin.LoginType.FACEBOOK
 *      scope = facebook scopes like ["public_profile", "email"]
 *      clientId = google client Id
 * @returns {Promise}
 */
socialLogin.login = function(arg) {
    return new Promise(function (resolve, reject) {
        switch (arg.type) {
            case LoginType.GOOGLE:
                // Configure Google Sign In
                var googleSignInOptions = new com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestIdToken(arg.clientId)
                    .requestEmail()
                    .build();

                var onConnectionFailedListener = new com.google.android.gms.common.api.GoogleApiClient.OnConnectionFailedListener({
                    onConnectionFailed: function (connectionResult) {
                        reject(connectionResult.getErrorMessage());
                    }
                });

                var mGoogleApiClient = new com.google.android.gms.common.api.GoogleApiClient.Builder(appModule.android.context)
                    .addOnConnectionFailedListener(onConnectionFailedListener)
                    .addApi(com.google.android.gms.auth.api.Auth.GOOGLE_SIGN_IN_API, googleSignInOptions)
                    .build();

                var signInIntent = com.google.android.gms.auth.api.Auth.GoogleSignInApi.getSignInIntent(mGoogleApiClient);
                appModule.android.currentContext.startActivityForResult(signInIntent, GOOGLE_SIGNIN_INTENT_ID);

                appModule.android.on(appModule.AndroidApplication.activityResultEvent, function(eventData) {
                    if (eventData.requestCode === GOOGLE_SIGNIN_INTENT_ID) {
                        var googleSignInResult = com.google.android.gms.auth.api.Auth.GoogleSignInApi.getSignInResultFromIntent(eventData.intent);
                        var success = googleSignInResult.isSuccess();
                        if (success) {
                            var googleSignInAccount = googleSignInResult.getSignInAccount();
                            resolve(toLoginResult({
                                token: googleSignInAccount.getIdToken()
                            }))
                        } else {
                            console.log("Make sure you've uploaded you SHA1 fingerprint(s) to the Firebase console");
                            reject("Has the SHA1 fingerprint been uploaded? Sign-in status: " + googleSignInResult.getStatus());
                        }
                    }
                });

                break;

            case LoginType.FACEBOOK:
                if (typeof(com.facebook) === "undefined") {
                    reject("Facebook SDK not installed - see gradle config");
                    return;
                }

                var fbLoginManager = com.facebook.login.LoginManager.getInstance();
                fbLoginManager.registerCallback(
                    fbCallbackManager,
                    new com.facebook.FacebookCallback({
                        onSuccess: function (loginResult) {
                            console.log(loginResult);
                            resolve(toLoginResult({
                                token: loginResult.getAccessToken().getToken()
                            }))
                        },
                        onCancel: function() {
                            reject("Facebook Login canceled");
                        },
                        onError: function(ex) {
                            reject("Error while trying to login with Fb "+ex);
                        }
                    })
                );

                var scope = ["public_profile", "email"];
                if (arg.scope) {
                    scope = arg.scope;
                }
                var permissions = utils.ad.collections.stringArrayToStringSet(scope);

                var activity = appModule.android.foregroundActivity;
                fbLoginManager.logInWithReadPermissions(activity, permissions);
                break;
        }
    });
};

socialLogin.LoginType = LoginType;
module.exports = socialLogin;
