## Introduction

This is unofficial documentation for [R8](https://android-developers.googleblog.com/2018/11/r8-new-code-shrinker-from-google-is.html), Google's code shrinker for Android&trade;.
Google intends R8 to be a drop-in replacement for [ProGuard](https://www.guardsquare.com/en/products/proguard), and, as R8 is designed to be compatible with most ProGuard rules, the [ProGuard Manual](pg_man) is a valuable reference for R8.
However, there still are substantial differences between R8 and ProGuard, and Google has not documented those differences.
This site is meant to fill that gap.

This site is [open source on GitHub&trade;](https://github.com/preemptive/r8-docs) and we encourage you to contribute by opening [issues](https://github.com/preemptive/r8-docs/issues) or submitting pull requests.

### Assumptions

This documentation assumes that you are using the standard Gradle&trade; build process of an Android application or library with version 3.4 or later of the Android Gradle Plugin.
It is not suitable if you are using R8 directly in a custom build process.

>**Note:** Known issues reflected in this document were last tested on R8 v1.4.77 using Android Gradle Plugin v3.4.0-rc03.

### Who We Are

[PreEmptive Solutions](https://www.preemptive.com) is the developer of [PreEmptive Protection&trade; - DashO&trade;](https://www.preemptive.com/products/dasho/overview), which provides powerful obfuscation and shielding for Android applications and libraries.

<a name="enabling"></a>
## Enabling R8

You can enable R8 in your Android project for a build type by using the `minifyEnabled` setting in your application's or library's Gradle build script:

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

You can specify any number of R8 configuration files for a build type or product flavor using the `proguardFiles` setting in your application's or library's Gradle build script:

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
You can use `'proguard-android.txt'` for the default rule set used by the Android Gradle Plugin, or `'proguard-android-optimize.txt'` to enable optimization.

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
| `-allowaccessmodification`            | Allows R8 to change access modifiers, enabling additional optimizations and additional reorganizations to packages in which classes are contained. ([ProGuard docs](pg_man#allowaccessmodification)) |
| `-assumenosideeffects <class-spec>`   | Informs R8 it can safely remove calls to the specified [method(s)](#class_spec) during optimization. If the method returns a value that appears to be used, the call may not be removed. Note that this rule is ignored if `-dontoptimize` is also configured. ([ProGuard docs](pg_man#assumenosideeffects)) |
| `-dontobfuscate`                      | Do not apply renaming, regardless of other configuration. ([ProGuard docs](pg_man#dontobfuscate)) |
| `-dontoptimize`                       | Do not optimize the code, regardless of other configuration. This is part of the [default](#rules_note) configuration. ([ProGuard docs](pg_man#dontoptimize)) |
| `-dontshrink`                         | Do not remove any classes, methods, or fields, regardless of other configuration. ([ProGuard docs](pg_man#dontshrink)) |
| `-include <filename>`                 | Include configuration from file with filename `filename`. ([ProGuard docs](pg_man#at)) |
| `-keepattributes [filter]`            | Allows you to specify supported Java [attributes](pg_man/attributes) for R8 to retain in the code. Unlike ProGuard, R8 does not respect rules regarding `Synthetic`, `Deprecated`, or `MethodParameters` and will remove these attributes regardless of what is configured in `-keepattributes`. Also, for class version 50 (Java 6), R8 will keep a `StackMapTable` attribute only if `StackMapTable` is covered by `-keepattributes`; it is always kept for later class versions. ([ProGuard docs](pg_man#keepattributes)) ([See issue](itg/130421335))|
| `-printconfiguration [file]`          | Outputs the used configuration rules to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. ([ProGuard docs](pg_man#printconfiguration)) |
| `-printseeds [{filename}]`            | Outputs a list of the classes, methods, and fields which match the [keep options](#keep_options) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/seeds.txt file. ([ProGuard docs](pg_man#printseeds)) |
| `-printusage [{filename}]`            | Outputs a list of the classes, methods, and fields which were removed during [shrinking](#keep_options) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/usage.txt file. ([ProGuard docs](pg_man#printusage)) |

<a name="keep_options"></a>
## Keep Options

Application of shrinking and renaming is configured by using the `-keep*` options.
These options are configured by proving a [class specification](#class_spec) and optional [modifiers](#modifiers).

| Option (and Arguments)                                     | Description                                                                                                    |
|------------------------------------------------------------|------------------------------------------------------------------------|
| `-keep[,modifier[...]] <class-spec>`                       | Exclude matching classes, and matching members if specified, from shrinking, optimization, and renaming. Shrinking exclusion on the class means that members will not be removed, but does not prevent members from being renamed. Specifying members will prevent them from being renamed if present. ([ProGuard docs](pg_man#keep)) |
| `-keepclassmembers[,modifier[...]] <class-spec>`           | Exclude matching members in matching classes from shrinking, optimization, and renaming. ([ProGuard docs](pg_man#keepclassmembers)) |
| `-keepclasseswithmembers[,modifier[...]] <class-spec>`     | Exclude matching classes and matching members from shrinking, optimization, and renaming if the corresponding class has all of the specified members. ([ProGuard docs](pg_man#keepclasseswithmembers)) |
| `-keepnames[,modifier[...]] <class-spec>`                  | Prevent matching classes, and matching members if specified, from being renamed. ([ProGuard docs](pg_man#keepnames)) |
| `-keepclassmembernames[,modifier[...]] <class-spec>`       | Prevent any matching members from being renamed in matching classes. ([ProGuard docs](pg_man#keepclassmembernames)) |
| `-keepclasseswithmembernames[,modifier[...]] <class-spec>` | Prevent matching classes and matching members from being renamed if the corresponding class contains all of the specified members. This does not prevent matching members from being removed by shrinking (ProGuard would also prevent the specified members from being removed). ([ProGuard docs](pg_man#keepclasseswithmembernames)) |
| `-whyareyoukeeping <class-spec>`                           | Log details about why particular classes and members were maintained in the output. ([ProGuard docs](pg_man#whyareyoukeeping)) |
| `-if <class-spec> <one-keep-option>`                           | Conditionally apply one keep option. If class members are specified, the class and all specified members must match. Otherwise, only the class need match. Class specification in the keep option can contain back references to wildcards in the `-if` class specification. ([ProGuard docs](pg_man#if)) |

<a name="modifiers"></a>
Keep option modifiers:

| Modifier                   | Effect                                                      |
|----------------------------|-------------------------------------------------------------|
| `allowshrinking`           | Allow the target(s) of the rule to be removed by shrinking. ([ProGuard docs](pg_man#allowshrinking)) |
| `allowoptimization`        | Allow the target(s) of the rule to be optimized. ([ProGuard docs](pg_man#allowoptimization)) |
| `allowobfuscation`         | Allow the target(s) of the rule to be renamed. Adding this modifier to one of the `-keep*names` options causes that option to have no effect. ([ProGuard docs](pg_man#allowobfuscation)) |
| `includedescriptorclasses` | Prevent specified field types, method return types, and method parameter types from being renamed. This preserves field and method signatures (post type-erasure, e.g. this does not preserve generic types). ([ProGuard docs](pg_man#includedescriptorclasses)) |

>**NOTE:** It is not clear what optimization R8 does, or how much control over that process is provided through the `-keep*` options and the `allowoptimization` modifier.

<a name="class_spec"></a>
### Class Specification

Several of the options accept a class specification (`class-spec`) which is a specification of classes and members that has a Java-like syntax.
For example:

```
-keepclassmembernames class some.path.to.MyClass {
    int intField;
    android.content.Context getApplicationContext();
}
```

The syntax has strong support for filtering classes, methods, and fields.
The syntax supports `class` (classes), `interface` (interfaces), `enum` (enumerations), and `@interface` (annotations).
The special symbol `<init>` is used to represent the name of a class's constructor.

The syntax also supports wildcards and negation using special characters :

* `!` negates the condition described by the subsequent specification.
* `*` a sequence of zero or more characters, other than package separators (`.`), when used with other symbols in a pattern. Matches any reference type when used alone (this is not supported in all contexts in ProGuard).
* `**` a sequence of zero or more characters, including package separators (`.`), when used with other symbols in a pattern. Matches any reference type when used alone (does not match primitive types or `void`).
* `***` a sequence of zero or more characters, including package separators (`.`), when used with other symbols in a pattern. Matches any reference type, primitive type, or `void` when used alone.
* `%` matches any primitive type (does not match `void`) when used alone.
* `?` matches any one character.
* `<integer>` integer (starting at 1) referencing the value that matched a wildcard used earlier in the specification. 
For `-if`-predicated `-keep*` options, the index can reference any earlier wildcard match in the specification for either part.
Neither R8 nor ProGuard seem to handle back references in the presence of wildcards in both the class name and class member names.
R8 does not appear to handle back references within member specifications.
* `...` matches any number of arguments when used within parentheses (`(` and `)`) of a method specification.

For example:

```
-keepclassmembernames class * { long *UUID; } # don't rename long-valued fields ending with UUID in classes
```

Note that R8 does not currently respect negation (`!`) of class member expressions in class specifications for the `-if`, `-keepclasseswithmembers`, and `-keepclasseswithmembernames` ([See issue](itg/130665986)).

There are two powerful constructs that can be used with class filtering: subtype matching and annotated matching.

Specify either `extends <type-name>` or `implements <interface-name>` to match types that either extend or implement another type.
For example, `-keep class * implements some.particular.SpecialInterface` will match all classes that implement `SpecialInterface`.
Note that `extends` and `implements` can be used interchangeably.

Specify an annotation on the type filter to indicate that only types that are annotated with that annotation should match the filter.
For example, `-keep @some.package.SomeAnnotation interface *` will match all interfaces that are annotated with `@SomeAnnotation`.

Several other useful constructs recognized in the class specification:

* `<fields>;` is a special string representing all fields
* `<methods>;` is a special string representing all methods

>**NOTE:** There are some differences between how the filter syntax is interpreted by R8 and ProGuard.
> For example, `*;` represents all fields and methods in both, but only R8 recognizes `* *;` (all fields) and `* *(...);` (all methods).

## Renaming Configuration

There are several rules which control the naming of classes, methods, and fields:

| Rule                                  |  Description                         |
|---------------------------------------|--------------------------------------|
| `-keeppackagenames {filter}`          | Don't rename packages which match the [filter](pg_man#filter). ([ProGuard docs](pg_man#keeppackagenames)) ([See issue](itg/130135768)) |
| `-flattenpackagehierarchy {name}`     | When renaming a class, move the package containing the class to a common base package `{name}`. Using `-allowaccessmodification` increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#flattenpackagehierarchy)) ([See note](#flat_repack_note)) |
| `-repackageclasses {name}`            | When renaming a class, move it to package `{name}`. *(Overrides `-flattenpackagehierarchy`)*  Using `-allowaccessmodification` increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#repackageclasses)) ([See note](#flat_repack_note)) |
| `-overloadaggressively`               | Use the same name as much as possible, even if it may not be allowed by the source language. ([ProGuard docs](pg_man#overloadaggressively)) |
| `-adaptclassstrings {filter}`         | Update strings containing class names to use the new names. This can be [filtered](pg_man#filter) to only look for strings in certain classes. ([ProGuard docs](pg_man#adaptclassstrings)) |
| `-adaptresourcefilenames {filter}`    | Rename Java resource files to match renamed classes. This can be [filtered](pg_man#filter) to look at particular files. ([ProGuard docs](pg_man#adaptresourcefilenames)) |
| `-adaptresourcefilecontents {filter}` | Update Java resource file contents to match renamed classes. This can be [filtered](pg_man#filter) to look at particular files. ([ProGuard docs](pg_man#adaptresourcefilecontents)) |

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

The following settings will cause R8 to issue an error:

* `-microedition`
* `-skipnonpubliclibraryclasses`
* `includecode` (modifier used with `-keep*` options)

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
* `-verbose`

### Not Applicable

R8 is designed for use with Android projects.
However some options it supports are not applicable in Android projects:

| Rule                            | Description                                |
|---------------------------------|--------------------------------------------|
| `-keepdirectories {filter}`     | Keep directory entries in the output jar or zip file. ([ProGuard rules](pg_man#keepdirectories)) |


## Troubleshooting

### ProGuard appears to be running instead of R8

Make sure that you do not have `android.enableR8=false` in your `gradle.properties` file.

>**Note:** If you are using a version of the Android Gradle Plugin prior to 3.4, you will need to set `android.enableR8=true` in your `gradle.properties` file to enable R8.

### Neither R8 nor ProGuard appears to be enabled

Make sure that you have set `minifyEnabled` for all of the build types on which you want R8 to run.
See [Enabling R8](#enabling) for details.
