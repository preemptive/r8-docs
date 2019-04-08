## Introduction

## Enabling

You can enable a ProGuard or R8 in your Android project for a build type by using the `minifyEnabled` setting in your application or library's Gradle buildscript:

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



