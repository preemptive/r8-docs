## Introduction

## Enabling

When `minifyEnabled` is set to `true` the Android Gradle Plugin will use either R8 or ProGuard for minification.
R8 has been available since v3.2.0 of the Android Gradle Plugin and is enabled by default in v3.4.0.
In prior versions it can be enabled by adding `android.enableR8=true` to the `gradle.properties` file.

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



