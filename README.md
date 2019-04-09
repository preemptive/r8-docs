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

R8 has been available with the Android Gradle Plugin since v3.2.0, and is the default minifier used when `minifyEnabled` is set to `true` in v3.4.0 and later.
To enable R8 with versions of the Android Gradle Plugin prior to v3.4.0, add `android.enableR8=true` to your `gradle.properties` file.

You can enable additional optimizations by enabling R8's *Full Mode* in your `gradle.properties` file ([Learn More](https://android-developers.googleblog.com/2018/11/r8-new-code-shrinker-from-google-is.html)):

```properties
android.enableR8.fullMode=true
```

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

You can also configure product flavor specific rules using using `proguardFile`:

```gradle
android {
    flavorDimensions 'monetization'
    productFlavors {
        free {
            dimension 'monetization'
            proguardFile 'free-rules.txt' 
        }
        paid {
            dimension 'monetization'
            proguardFile 'paid-rules.txt' 
        }
    }
}
```

## Minification and Obfuscation

Minification and Obfuscation are configured by using the many  `-keep` based rules.

|                       Name               |        Description                                 |
|------------------------------------------|----------------------------------------------------|
| `-keep class` *{specification}*          | ...                                                |

## Renaming Configuration

By using dictionaries and maps, it is possible to control, to a degree, how R8 will determine the new names for classes, methods, and fields.

## Unsupported Options

Some ProGuard options are unsupported by R8 and will not be honored.

The following setting will cause R8 to issue an error:

* `-skipnonpubliclibraryclasses`

The following settings will cause R8 to issue a warning message:

* `-optimizationpasses` (enabled by `proguard-android-optimize.txt`)
* `-optimizations`

The following settings are ignored:

* `-addconfigurationdebugging`
* `-android`
* `-assumenoescapingparameters`
* `-assumenoexternalreturnvalues`
* `-assumenoexternalsideefffects`
* `-dontpreverify`
* `-dontskipnonpubliclibraryclasses`
* `-dontskipnonpubliclibraryclassmembers`
* `-dontusemixedcaseclassnames`
* `-dump`
* `-forceprocessing`
* `-keepparameternames`
* `-mergeinterfacesaggressively`
* `-outjars`
* `-target`
* `-useuniqueclassmembernames`
