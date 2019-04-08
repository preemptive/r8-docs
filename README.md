## Introduction

## Enabling R8

You can enable ProGuard or R8 in your Android project for a build type by using the `minifyEnabled` setting in your application's or library's Gradle buildscript:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
        } 
    } 
}
```

R8 has been available with the Android Gradle Plugin since v3.2.0, and is enabled by default in v3.4.0 and later.
To enable R8 with versions of the Android Gradle Plugin where R8 is supported but not enabled by default (v3.2.x or v3.3.x), add `android.enableR8=true` to your `gradle.properties` file.

### Specifying R8 Configuration Files

You can specify any number of R8 configuration files for a build type or product flavor using the `proguardFiles` setting in your application's or library's Gradle buildscript:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'custom-rules.txt' 
        } 
    }
}
```

The `getDefaultProguardFile()` method specifies a configuration file provided by the Android Gradle Plugin that contains basic settings.
You can use `'proguard-android.txt'` for the default ruleset used by the Android Gradle Plugin, or `'proguard-android-optimize.txt'` to enable optimization.

In this example, `'custom-rules.txt'` refers to a configuration file named 'custom-rules.txt' in the same directory as your application's or library's `build.gradle` file.
You can specify your own R8 rules in such a file.

>**NOTE:** The Android Gradle Plugin will generate additional rules based on references to classes in your application's or library's manifest and resources.

## Minification and Obfuscation

Minification and Obfuscation are configured by using the many  `-keep` based rules.

|                       Name               |        Description                                 |
|------------------------------------------|----------------------------------------------------|
| `-keep class` *{specification}*          | ...                                                |

## Renaming Configuration

By using dictionaries and maps, it is possible to control, to a degree, how R8 will determine the new names for classes, methods, and fields.

## Unsupported Options

There are several ProGuard rules which R8 does not support.  It may error or just ignore the rule.

### Erroring Options

Some options are not supported and will cause R8 to error. 

* `-skipnonpubliclibraryclasses`


### Ignored options

Some options are simply not relvant to Android projects and will be ignored.

* `-optimizationpasses`



