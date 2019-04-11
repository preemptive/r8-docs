## Introduction

This site is unofficial documentation for [R8](https://android-developers.googleblog.com/2018/11/r8-new-code-shrinker-from-google-is.html), Google's code shrinker for Android.
Google intends R8 to be a drop-in replacement for [ProGuard](https://www.guardsquare.com/en/products/proguard), and, as R8 is designed to be compatible with most R8 rules, the [ProGuard Manual](pg_man) is a valuable reference for R8.
However, there still are substantial differences between R8 and ProGuard, and Google has not documented those differences.
This site is meant to fill that gap.

This site is [open source on GitHub](https://github.com/preemptive/r8-docs) and we encourage you to contribute by opening [issues](https://github.com/preemptive/r8-docs/issues) or submitting pull requests.

### Assumptions

This documentation assumes that you are using the standard Gradle build process of an Android application or library with version 3.4 or later of the Android Gradle Plugin.
It is not suitable if you are using R8 directly in a custom build process.

>**Note:** Known issues reflected in this document were last tested on R8 v1.4.77 using Android Gradle Plugin v3.4.0-rc03.

### Who We Are

[PreEmptive Solutions](https://www.preemptive.com) is the developer of [PreEmptive Protection - DashO](https://www.preemptive.com/products/dasho/overview), which provides powerful obfuscation and shielding for Android applications and libraries.

## Enabling R8

You can enable R8 in your Android project for a build type by using the `minifyEnabled` setting in your application's or library's Gradle buildscript:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
        } 
    } 
}
```

R8 defaults to using ProGuard-compatible optimizations, but you can enable additional optimizations by enabling R8's *Full Mode* in your `gradle.properties` file ([Learn More](https://android-developers.googleblog.com/2018/11/r8-new-code-shrinker-from-google-is.html)):

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

<a name="rules_note"></a>
>**NOTE:** The Android Gradle Plugin will generate additional rules based on references to classes in your application's or library's manifest and resources.
>If no `proguardFile` or `proguardFiles` configuration is provided, R8 will also add the configuration from the default `proguard-android.txt` file.

You can also configure flavor specific rules using using `proguardFile`:

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

## General Options

| Rule                                  | Description                          |
|---------------------------------------|--------------------------------------|
| `-allowaccessmodification`            | ([ProGuard docs](pg_man#allowaccessmodification)) |
| `-assumenosideeffects <class-spec>`   | Informs R8 it can safely remove calls to the specified [method(s)](#classSpecTBD) during optimization. If the method returns a value that appears to be used, the call may not be removed. Note that this rule is ignored if `-dontoptimize` is also configured. ([ProGuard docs](pg_man#assumenosideeffects)) |
| `-dontobfuscate`                      | Do not apply (renaming) obfsucation, regardless of other configuration. ([ProGuard docs](pg_man#dontobfuscate)) |
| `-dontoptimize`                       | Do not optimize the code, regardless of other configuration. This is part of the [default](#rules_note) configuration. ([ProGuard docs](pg_man#dontoptimize)) |
| `-dontshrink`                         | Do not remove any classes, methods, or fields, regardless of other configuration. ([ProGuard docs](pg_man#dontshrink)) |
| `-microedition`                       | ([ProGuard docs](pg_man#microedition)) |
| `-printconfiguration`                 | ([ProGuard docs](pg_man#printconfiguration)) |
| `-printseeds [{filename}]`            | Outputs a list of the classes, methods, and fields which match the [keep rules](#minification) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of any variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/seeds.txt file. ([ProGuard docs](pg_man#printseeds)) |
| `-printusage [{filename}]`            | Outputs a list of the classes, methods, and fields which were removed during [minification](#minification) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of any variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/usage.txt file. ([ProGuard docs](pg_man#printusage)) |
| `-verbose`                            | ([ProGuard docs](pg_man#verbose)) |

<a name="minification"></a>
## Minification and Obfuscation

Minification and Obfuscation are configured by using the many  `-keep` based rules.

|                       Name               |        Description                                 |
|------------------------------------------|----------------------------------------------------|
| `-keep class` *{specification}*          | ...                                                |

## Renaming Configuration

There are several rules which control the naming of classes, methods, and fields:

| Rule                                  |  Description                         |
|---------------------------------------|--------------------------------------|
| `-dontobfuscate`                      | Don't rename any classes, methods, or fields. ([ProGuard docs](pg_man#dontobfuscate)) |
| `-keeppackagenames {filter}`          | Don't rename packages which match the [filter](pg_man#filter). ([ProGuard docs](pg_man#keeppackagenames)) ([See issue](itg/130135768)) |
| `-flattenpackagehierarchy {name}`     | When renaming a class, move the package containing the class to a common base package `{name}`. Using `-allowaccessmodification` increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#flattenpackagehierarchy)) ([See note](#flat_repack_note)) |
| `-repackageclasses {name}`            | When renaming a class, move it to package `{name}`. *(Overrides `-flattenpackagehierarchy`)*  Using `-allowaccessmodification` increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#repackageclasses)) ([See note](#flat_repack_note)) |
| `-overloadaggressively`               | Use the same name as much as possible, even if it may not be allowed by the source language. ([ProGuard docs](pg_man#overloadaggressively)) |
| `-adaptclassstrings {filter}`         | Update strings containing classnames to use the new names. This can be [filtered](pg_man#filter) to only look for strings in certain classes. ([ProGuard docs](pg_man#adaptclassstrings)) |
| `-adaptresourcefilenames {filter}`    | ... |
| `-adaptresourcefilecontents {filter}` | ... |

<a name="flat_repack_note"></a>
#### Flatten vs. Repackage
There is a subtle difference between `-flattenpackagehierarchy` and `-repackageclasses`.
`-repackageclasses` moves the classes into a single package.
`-flattenpackagehierarchy` renames the packages to be based on the name, keeping classes in their own package.

Given three classes:

* `com.example.packageOne.ClassOne`
* `com.example.packageOne.subPackageOne.ClassTwo`
* `com.example.packageTwo.ClassThree`

`-repackageclasses "go.here"` will result in:

```
com.example.packageOne.ClassOne -> go.here.a:
com.example.packageOne.subPackageOne.ClassTwo -> go.here.b:
com.example.packageTwo.ClassThree -> go.here.c:
```

`-flattenpackagehierarchy "go.here"` will result in:

```
com.example.packageOne.ClassOne -> go.here.a.a:
com.example.packageOne.subPackageOne.ClassTwo -> go.here.b.a:
com.example.packageTwo.ClassThree -> go.here.c.a:
```


### Dictionaries

R8 will provide new names by cycling through the English alphabet.
By using dictionaries it is possible to control, to a degree, how R8 will determine the new names for classes, methods, and fields.

| Rule                                       | Description                     |
|--------------------------------------------|---------------------------------|
| `-classobfuscationdictionary {filename}`   | Use the specified [file](#dict_file) to find new names for classes. ([ProGuard docs](pg_man#classobfuscationdictionary)) |
| `-obfuscationdictionary {filename}`        | Use the specified [file](#dict_file) to find new names for methods and fields. ([ProGuard docs](pg_man#obfuscationdictionary)) |
| `-packageobfuscationdictionary {filename}` | Use the specified [file](#dict_file) to find new names for packages. ([ProGuard docs](pg_man#packageobfuscationdictionary)) |

<a name="dict_file"></a>

#### Dictionary Files

The dictionary files contain lists of unique names separated by whitespace or punctuation.
A `#` can be used to specify a comment.
The `{filename}` specified should be relative to the directory containing the rules file.
The names must consist of characters allowed for Java identifiers.

```
a1, a2, a3 #A few identifiers
class package for while do if else switch goto this null #Reserved word identifiers
#Identifiers on their own lines
q
w
e
r
t
y
```

### Mapping Files

Map files contain direct links between the original and new names of classes, methods, and fields.

| Rule                       | Description                                     |
|----------------------------|-------------------------------------------------|
| `-applymapping {filename}` | Use the specified map for renaming. ([ProGuard docs](pg_man#applymapping)) ([See issue](itg/130132888)) |
| `-printmapping {filename}` | Print a mapping from the original to the new names. ([ProGuard docs](pg_man#printmapping)) ([See note](#printmapping)) |

<a name="printmapping"></a>

#### -printmapping

Regardless of the `-printmapping` rule, maps will always be output to a variant specific file (e.g.`build/outputs/mapping[/r8][/{flavorName}]/{buildType}/mapping.txt`).
If `-printmapping` is in a configuration that is used by more that one variant, the configured file will be overwritten to reflect whichever variant built last.

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
