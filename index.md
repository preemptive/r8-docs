## Introduction

This is unofficial documentation for [R8](https://android-developers.googleblog.com/2018/11/r8-new-code-shrinker-from-google-is.html), Google's code shrinker for Android&trade;.
Google intends R8 to be a drop-in replacement for [ProGuard](https://www.guardsquare.com/en/products/proguard), and has provided [documentation in the Android Studio User Guide](https://developer.android.com/studio/build/shrink-code) to help you get started with it.
However, they rely on the [ProGuard Manual](pg_man) for detailed documentation, even though there are substantial differences between R8 and ProGuard.
This documentation is meant to supplement the Android Studio User Guide and the ProGuard Manual to fill that gap.

This site is [open source on GitHub&trade;](https://github.com/preemptive/r8-docs) and we encourage you to contribute by opening [issues](https://github.com/preemptive/r8-docs/issues) or submitting pull requests.

### Assumptions

This documentation assumes that you are using the standard Gradle&trade; build process of an Android application or library with version 3.4 or later of the Android Gradle Plugin.
It is not suitable if you are using R8 directly in a custom build process.

>**Note:** Known issues reflected in this document were last tested on R8 v1.4.77 using Android Gradle Plugin v3.4.0.

### Obfuscation, Shrinking, Renaming, and Minification - What's the Difference?

The [Android Studio documentation](https://developer.android.com/studio/build/shrink-code) and the R8 ruleset itself use the term "obfuscation" in a way that isn't very precise.
As [we make an Android Obfuscator](https://www.preemptive.com/products/dasho/overview), we think it's important to understand the distinction between *Obfuscation*, *Renaming*, *Shrinking*, and *Minification*.

* *Obfuscation* generally refers to a broad set of techniques that make code more difficult to understand and reverse engineer, but in the context of R8 rules and documentation it specifically refers to *Renaming* of packages, classes, methods, and fields that R8 performs.
  R8 employs renaming primarily to reduce the size of the application or library on which it is operating, not to protect it from reverse engineering.
  We avoid using the term "obfuscation" in this documentation in favor of "renaming".
* *Code Shrinking* or *Tree Shaking* refers to the removal of unused classes and members from your application or library, primarily to reduce its size.
* *Minification*, as in `minifyEnabled`, is sometimes used to describe the combination of Shrinking and Renaming for the purpose of reducing the size of an application or library.

In addition to Renaming and Code Shrinking, R8 also performs *Optimization*, which rewrites code to improve its performance and further reduce its size.
The Android Gradle Plugin also performs *Resource Shrinking*, which reduces the size of resources in a similiar manner to the way that Code Shrinking reduces the size of applications or libraries.
This is not a feature of R8 itself, but they are related processes; the Android Gradle Plugin requires that you enable a code shrinker to shrink resources.

### Who We Are

We are [PreEmptive Solutions](https://www.preemptive.com).
We believe a comprehensive obfuscation solution **must** do more than just minification.
We make [PreEmptive Protection&trade; DashO&trade; for Android & Java](https://www.preemptive.com/products/dasho/overview), which provides powerful obfuscation and shielding for Android applications and libraries.

The [DashO 10 beta](https://www.preemptive.com/blog/article/1113-dasho-10-beta-2-from-the-ground-up/89-dasho) allows you to leverage DashO’s powerful protection features, including [Control Flow Obfuscation](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_obfuscation_control.html) and [String Encryption](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_obfuscation_string_encryption.html), without sacrificing R8's features and build performance.
It also includes active Checks, such as [Root Checks](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_checks_root.html), [Debugging Checks](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_checks_debug.html), [Emulator Checks](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_checks_emulator.html), and [Tamper Checks](https://www.preemptive.com/dasho/pro/10.0/userguide/en/understanding_checks_tamper.html).

>**Download a [free trial](https://www.preemptive.com/dasho-10-beta-2) of the DashO 10 beta which includes our world-class support.**

## General Rules

| Rule                                  | Description                          |
|---------------------------------------|--------------------------------------|
| `-allowaccessmodification`            | Allows R8 to change access modifiers, enabling additional optimizations and additional reorganizations to packages in which classes are contained. ([ProGuard docs](pg_man#allowaccessmodification)) |
| `-assumenosideeffects <class-spec>`   | Informs R8 it can safely remove calls to the specified [method(s)](#class_spec) during optimization. If the method returns a value that appears to be used, the call may not be removed. Note that this rule is ignored if `-dontoptimize` is also configured. ([ProGuard docs](pg_man#assumenosideeffects)) |
| `-dontobfuscate`                      | Do not apply renaming, regardless of other configuration. ([ProGuard docs](pg_man#dontobfuscate)) |
| `-dontoptimize`                       | Do not optimize the code, regardless of other configuration. This is part of the [default](#rules_note) configuration. ([ProGuard docs](pg_man#dontoptimize)) |
| `-dontshrink`                         | Do not remove any classes, methods, or fields, regardless of other configuration. ([ProGuard docs](pg_man#dontshrink)) |
| `-include <filename>`                 | Include configuration from file with filename `filename`. ([ProGuard docs](pg_man#at)) |
| `-keepattributes [<filter>]`          | Allows you to specify supported Java&trade; [attributes](pg_man/attributes) for R8 to retain in the code. Unlike ProGuard, R8 does not respect rules regarding `Synthetic`, `Deprecated`, or `MethodParameters` and will remove these attributes regardless of what is configured in `-keepattributes`. Also, for class version 50 (Java 6), R8 will keep a `StackMapTable` attribute only if `StackMapTable` is covered by `-keepattributes`; it is always kept for later class versions. ([ProGuard docs](pg_man#keepattributes)) ([See issue](itg/130421335))|
| `-printconfiguration [<file>]`        | Outputs the used configuration rules to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. ([ProGuard docs](pg_man#printconfiguration)) |
| `-printseeds [<filename>]`            | Outputs a list of the classes, methods, and fields which match the [keep rules](#keep_rules) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/seeds.txt file. ([ProGuard docs](pg_man#printseeds)) |
| `-printusage [<filename>]`            | Outputs a list of the classes, methods, and fields which were removed during [shrinking](#keep_rules) to the specified file, or to stdout if there is no file specified. Note that if you specify a file, every build of a variant using this rule will overwrite that file. Note that unlike ProGuard, R8 will **not** automatically output a build/outputs/mapping[/{flavorName}]/{buildType}/usage.txt file. ([ProGuard docs](pg_man#printusage)) |

<a name="keep_rules"></a>
## Keep Rules

Application of shrinking and renaming is configured by using the `-keep*` rules.
These rules are configured by proving a [class specification](#class_spec) and optional [modifiers](#modifiers).

| Rule (and Arguments)                                         | Description   |
|--------------------------------------------------------------|---------------|
| `-keep[,<modifier>[...]] <class-spec>`                       | Exclude matching classes, and matching members if specified, from shrinking, optimization, and renaming. Shrinking exclusion on the class means that members will not be removed, but does not prevent members from being renamed. Specifying members will prevent them from being renamed if present. ([ProGuard docs](pg_man#keep)) |
| `-keepclassmembers[,<modifier>[...]] <class-spec>`           | Exclude matching members in matching classes from shrinking, optimization, and renaming. ([ProGuard docs](pg_man#keepclassmembers)) |
| `-keepclasseswithmembers[,<modifier>[...]] <class-spec>`     | Exclude matching classes and matching members from shrinking, optimization, and renaming if the corresponding class has all of the specified members. ([ProGuard docs](pg_man#keepclasseswithmembers)) |
| `-keepnames[,<modifier>[...]] <class-spec>`                  | Prevent matching classes, and matching members if specified, from being renamed. ([ProGuard docs](pg_man#keepnames)) |
| `-keepclassmembernames[,<modifier>[...]] <class-spec>`       | Prevent any matching members from being renamed in matching classes. ([ProGuard docs](pg_man#keepclassmembernames)) |
| `-keepclasseswithmembernames[,<modifier>[...]] <class-spec>` | Prevent matching classes and matching members from being renamed if the corresponding class contains all of the specified members. This does not prevent matching members from being removed by shrinking (ProGuard would also prevent the specified members from being removed). ([ProGuard docs](pg_man#keepclasseswithmembernames)) |
| `-whyareyoukeeping <class-spec>`                             | Log details about why particular classes and members were maintained in the output. ([ProGuard docs](pg_man#whyareyoukeeping)) |
| `-if <class-spec> <one-keep-rule>`                           | Conditionally apply one keep rule. If class members are specified, the class and all specified members must match. Otherwise, only the class need match. Class specification in the keep rule can contain back references to wildcards in the `-if` class specification. ([ProGuard docs](pg_man#if)) |

>**Note:** R8's optimization may collapse parts of a class hierarchy.
For example, if an interface can be replaced everywhere with the only class that implements it, R8's optimizer might do this.
This can effectively change field and method signatures.
If this happens, fields and methods referenced in class specifications for `-keep*` rules may not match.
Conversely, some `-keep*` rules will effectively tell R8 not to alter the hierarchy.
This issue has been observed with use of `-keepnames` ([See issue](itg/130791310)).

<a name="modifiers"></a>
Keep rule modifiers:

| Modifier                         | Effect                                    |
|----------------------------------|-------------------------------------------|
| `allowshrinking`                 | Allow the target(s) of the rule to be removed by shrinking. ([ProGuard docs](pg_man#allowshrinking)) |
| `allowoptimization`              | Allow the target(s) of the rule to be optimized. ([ProGuard docs](pg_man#allowoptimization)) |
| `allowobfuscation`               | Allow the target(s) of the rule to be renamed. Adding this modifier to one of the `-keep*names` rules causes that rule to have no effect. ([ProGuard docs](pg_man#allowobfuscation)) |
| `includedescriptorclasses`       | Prevent specified field types, method return types, and method parameter types from being renamed. This preserves field and method signatures (post type-erasure, e.g. this does not preserve generic types). ([ProGuard docs](pg_man#includedescriptorclasses)) |

>**Note:** It is not clear what optimization R8 does, or how much control over that process is provided through the `-keep*` rules and the `allowoptimization` modifier.

<a name="class_spec"></a>
### Class Specification

Several of the rules accept a class specification (`class-spec`) which is a specification of classes and members that has a Java-like syntax.
For example:

```
-keepclassmembernames public class some.path.to.MyClass {
    int intField;
    android.content.Context getApplicationContext();
    public static String *;
}
```

The syntax has strong support for filtering classes, methods, and fields.
The syntax supports `class` (classes), `interface` (interfaces), `enum` (enumerations), and `@interface` (annotations).
The special symbol `<init>` is used to represent the name of a class's constructor.

#### Wildcards and Special Characters

The syntax also supports wildcards and negation using special characters:

* `!` negates the condition described by the subsequent specification. Can be used with [modifiers](#class-spec-modifiers) and with the `class`, `interface`, `enum`, and `@interface` keywords.
* `*` a sequence of zero or more characters, other than package separators (`.`), when used with other symbols in a pattern. Matches any reference type when used alone (this is not supported in all contexts in ProGuard).
* `**` a sequence of zero or more characters, including package separators (`.`), when used with other symbols in a pattern. Matches any reference type when used alone (does not match primitive types or `void`).
* `***` a sequence of zero or more characters, including package separators (`.`), when used with other symbols in a pattern. Matches any reference type, primitive type, or `void` when used alone.
* `%` matches any primitive type (does not match `void`) when used alone.
* `?` matches any one character.
* `<integer>` integer (starting at 1) referencing the value that matched a wildcard used earlier in the specification.
For `-if`-predicated `-keep*` rules, the index can reference any earlier wildcard match in the specification for either part.
Neither R8 nor ProGuard seem to handle back references in the presence of wildcards in both the class name and class member names.
R8 does not appear to handle back references within member specifications.
* `...` matches any number of arguments when used within parentheses (`(` and `)`) of a method specification.

For example:

```
-keepclassmembernames class * { long *UUID; } # don't rename long-valued fields ending with UUID in classes
```

Several other useful constructs are recognized in the class specification:

* `<fields>;` is a special string representing all fields
* `<methods>;` is a special string representing all methods

>**Note:** There are some differences between how the filter syntax is interpreted by R8 and ProGuard.
> For example, `*;` represents all fields and methods in both, but only R8 recognizes `* *;` (all fields) and `* *(...);` (all methods).

<a name="class-spec-modifiers"></a>
#### Modifiers

You can use the following modifier keywords to narrow down wildcards used in class specifications:

<div class="modifier-table"></div>

| Name           | Class | Method | Field | 
| -------------- | ----- | ------ | ----- |
| `abstract`     | ✓     | ✓      |       |
| `final`        | ✓     | ✓      | ✓     |
| `native`       |       | ✓      |       |
| `private`      |       | ✓      | ✓     |
| `protected`    |       | ✓      | ✓     |
| `public`       | ✓     | ✓      | ✓     |
| `static`       |       | ✓      | ✓     |
| `strictfp`     |       | ✓      |       |
| `synchronized` |       | ✓      |       |
| `transient`    |       |        | ✓     |
| `volatile`     |       |        | ✓     |


If multiple modifiers are used together on a single expression, then in most cases only classes, methods, or fields that match all of the applied modifiers will be matched. 
However, if mutually exclusive modifiers are applied (e.g., `private` and `protected`), classes, method, and fields that match either of the mutually exclusive modifiers may be matched.

For example:

```
-keep public class * { # All public classes
    public static *; # All public static fields in those classes
    public protected abstract *(...); # All public or protected abstract methods in those classes
}
    
```

#### Subtype Matching and Annotated Matching

There are two powerful constructs that can be used with class filtering: subtype matching and annotated matching.

Specify either `extends <type-name>` or `implements <interface-name>` to match types that either extend or implement another type.
For example, `-keep class * implements some.particular.SpecialInterface` will match all classes that implement `SpecialInterface`.
Note that `extends` and `implements` can be used interchangeably.

Specify an annotation on the type filter to indicate that only types that are annotated with that annotation should match the filter.
For example, `-keep @some.package.SomeAnnotation interface *` will match all interfaces that are annotated with `@SomeAnnotation`.


## Renaming Configuration

There are several rules which control the naming of classes, methods, and fields:

| Rule                                    |  Description                         |
|-----------------------------------------|--------------------------------------|
| `-keeppackagenames [<filter>]`          | Don't rename packages which match the [filter](pg_man#filter). ([ProGuard docs](pg_man#keeppackagenames)) ([See issue](itg/130135768)) |
| `-flattenpackagehierarchy [<name>]`     | When renaming a class, move the package containing the class to a common base package with the specified name, or to the default package if no name is specified. Using [`-allowaccessmodification`](#general-rules) increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#flattenpackagehierarchy)) ([See note](#flat_repack_note)) |
| `-repackageclasses [<name>]`            | When renaming a class, move it to the named package, or to the default package if no package is named. *(Overrides `-flattenpackagehierarchy`)*  Using [`-allowaccessmodification`](#general-rules) increases the number of classes which can be moved to a new package. ([ProGuard docs](pg_man#repackageclasses)) ([See note](#flat_repack_note)) |
| `-overloadaggressively`                 | Use the same name as much as possible, even if it may not be allowed by the source language. ([ProGuard docs](pg_man#overloadaggressively)) |
| `-adaptclassstrings [<filter>]`         | Update strings containing class names to use the new names. This can be [filtered](pg_man#filter) to only look for strings in certain classes. ([ProGuard docs](pg_man#adaptclassstrings)) |
| `-adaptresourcefilenames [<filter>]`    | Rename Java resource files to match renamed classes. This can be [filtered](pg_man#filter) to look at particular files. ([ProGuard docs](pg_man#adaptresourcefilenames)) |
| `-adaptresourcefilecontents [<filter>]` | Update Java resource file contents to match renamed classes. This can be [filtered](pg_man#filter) to look at particular files. ([ProGuard docs](pg_man#adaptresourcefilecontents)) |

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
| `-classobfuscationdictionary <filename>`   | Use the specified [file](#dict_file) to find new names for classes. ([ProGuard docs](pg_man#classobfuscationdictionary)) |
| `-obfuscationdictionary <filename>`        | Use the specified [file](#dict_file) to find new names for methods and fields. ([ProGuard docs](pg_man#obfuscationdictionary)) |
| `-packageobfuscationdictionary <filename>` | Use the specified [file](#dict_file) to find new names for packages. ([ProGuard docs](pg_man#packageobfuscationdictionary)) |

<a name="dict_file"></a>

#### Dictionary Files

The dictionary files contain lists of unique names separated by whitespace or punctuation.
A `#` can be used to specify a comment.
The filename specified should be relative to the directory containing the rules file.
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

| Rule                         | Description                                   |
|------------------------------|-----------------------------------------------|
| `-applymapping <filename>`   | Use the specified map for renaming. R8 is [incompatible](#applymapping) with ProGuard's behavior for this rule. ([ProGuard docs](pg_man#applymapping)) ([See issue](itg/130132888)) |
| `-printmapping [<filename>]` | Print a mapping from the original to the new names to the specified file, or to stdout if there is no file specified.  ([ProGuard docs](pg_man#printmapping)) ([See note](#printmapping)) |

<a name="applymapping"></a>
#### -applymapping

The `-applymapping` rule should force R8 to use the names from the map when assigning new names.
There are some [issues](itg/130132888) with how R8 handles `-applymapping`:

1. R8 will not honor names provided if there is no specific `-keep` rule in place for that class, method, or field.
2. R8 outputs a corrupt `mapping.txt` file when `-applymapping` is used.

Google is [not supporting](itg/130132888) this rule for incremental renaming, so it should be used carefully.
If you need a specific name given to a class, method, or field, you need to configure both `-applymapping` and `-keep`.

>**Note**: Do **NOT** use `-keep,allowobfuscation` in this scenario because R8 will not honor the new names from the map using that configuration.

<a name="printmapping"></a>
#### -printmapping

Regardless of the `-printmapping` rule, maps will always be output to a variant specific file (e.g.`build/outputs/mapping[/r8][/{flavorName}]/{buildType}/mapping.txt`).
If `-printmapping` is configured to print to a file in a configuration that is used by more that one variant, the configured file will be overwritten to reflect whichever variant built last.

## Unsupported Rules

Some ProGuard rules are unsupported by R8 and will not be honored.

The following rules will cause R8 to issue an error:

* `-microedition`
* `-skipnonpubliclibraryclasses`
* `includecode` (modifier used with `-keep*` rules) ([See issue](itg/73801028))

The following rules will cause R8 to issue a warning message:

* `-optimizationpasses` (enabled by `proguard-android-optimize.txt`)
* `-optimizations`

The following rules are ignored:

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
However some rules it supports are not applicable in Android projects:

| Rule                            | Description                                |
|---------------------------------|--------------------------------------------|
| `-keepdirectories [<filter>]`   | Keep directory entries in the output jar or zip file. ([ProGuard rules](pg_man#keepdirectories)) |

## Troubleshooting

This section describes some issues that you might encounter when trying to use R8.
You might also find details about your issue in the [Android Studio User Guide](https://developer.android.com/studio/build/shrink-code#troubleshoot), the [R8 Compatibility FAQ](https://r8.googlesource.com/r8/+/refs/heads/master/compatibility-faq.md), or [ProGuard's Troubleshooting page](https://www.guardsquare.com/en/products/proguard/manual/troubleshooting).

If you cannot find a solution to your problem, or if you otherwise encounter incorrect behavior, you can [report a bug](https://issuetracker.google.com/issues/new?component=326788&template=1025938) with the Google team.

### ProGuard appears to be running instead of R8

Make sure that you do not have `android.enableR8=false` in your `gradle.properties` file.

>**Note:** If you are using a version of the Android Gradle Plugin prior to 3.4, you will need to set `android.enableR8=true` in your `gradle.properties` file to enable R8.

### D8: Unsupported option: -skipnonpubliclibraryclasses

This rule is [unsupported in R8](#unsupported-rules).
Remove it from your configuration.

### Custom rules don't appear to be used

Make sure that any rule file that you want to use is properly configured in your Gradle build script with `proguardFiles`.
Relative paths configured in your Gradle build script should be relative to the application or library module for which you would like the rules to apply.
See the [Android Studio User Guide](https://developer.android.com/studio/build/shrink-code) for details.

>**Note:** The Android Gradle Plugin will not error or warn you if it cannot locate the specified file.

### The rule [some rule] uses extends but actually matches implements

R8 issues this warning if you use an `extends` rule to match descendents of an interface rather than `implements`, regardless of whether the descendents you're trying to match are classes or interfaces.
If the specified rule is a custom rule that you have created, you can update the rule to use `implements` rather than `extends`.
However, some libraries, including Android support libraries, contain rules that will produce this warning.
Unfortunately, there is no easy way to resolve or suppress the warning in that case.
