### Android
Install packages 'Google Play Services' and 'Google Repository' in your [Android SDK Manager](http://stackoverflow.com/a/37310513)

#### Open `platforms/android/build.gradle`
- Under configurations on dependencies, add google play server auth and facebook so it becomes something like:
```
  dependencies {
    compile "com.android.support:appcompat-v7:$suppotVer"
    compile 'com.google.android.gms:play-services-auth:9.4.0'
    compile 'com.facebook.android:facebook-android-sdk:4.14.1'
  }
```

- Add the very bottom of the same file add
```
  apply plugin: "com.google.gms.google-services"
```

FROM https://raw.githubusercontent.com/EddyVerbruggen/nativescript-plugin-firebase/ac561fa973789789ce7027dd6a6435fd3b38ee15/docs/AUTHENTICATION.md
1. If you didn't choose this feature during installation you can uncomment the facebook SDK in `node_modules\nativescript-plugin-firebase\platforms\android\include.gradle`
2. Add `<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>` to the `manifest/application tag` in `app\App_Resources\Android\AndroidManifest.xml`, so it becomes similar to this:

   ```xml
   	<application
   		android:name="com.tns.NativeScriptApplication"
   		..>

   		<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>

   		<activity
   			android:name="com.tns.NativeScriptActivity"
   			..>
   ```
3. Create a file `app\App_Resources\Android\values\facebooklogin.xml` and add this (replace the id):

   ```xml
   <?xml version='1.0' encoding='utf-8'?>
   <resources>
        <string name="facebook_app_id">126035687816994</string>
   </resources>
   ```
4. In your Facebook dev console, go to the Basic settings and add the Android platform if you haven't already. Then set the 'Google Play Packagename' to your applicationId (see your `package.json`) and set 'Classname' to `com.tns.NativeScriptActivity`.
5. Set the Key-Hash as well. If you don't know it you can try Facebook login in your app and observe the `adb logcat` output for something like `Key hash <......> does not match any stored key hashes.`
