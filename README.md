# Positron
Node framework for unpacking, patching, and re-packing [electron](https://www.electronjs.org) applications

## Usage
Packaged Electron apps store their JavaScript source code in `.asar` packages 
([more info](https://github.com/electron/asar)). This framework will read those asar packages, output the JavaScript
source to a pre-defined directory and any changes made to those files can be used to generate patch files. Those patch
files can then be stored and applied to the source later on which can then be used to re-package the source for the
electron app. 

### Installation
```
npm i https://github.com/alexsobiek/positron
```

### Usage
#### Getting Started
```javascript
const asarPackage = path.join(__dirname, "app.asar")    // Where our asar package is located
const sourceDir = path.join(__dirname, "source");       // Where we should dump contents of our asar package
const patchDir = path.join(__dirname, "patches");       // Where we should create and read patches from

const positron = new Positron(asarPackage, sourceDir, patchDir);    // Create new Positron instance
```

#### Unpackaging
```javascript
positron.unpackage();
```
#### Create Patches
```javascript
positron.makePatches();
```

#### Apply Patches
```javascript
positron.applyPatches();
```

#### Package new asar
```javascript
positron.package();
```

# Disclaimer
If you are unpacking and patching a closed-source application, it is very likely you are breaking a license or 
agreement. Publishing modified applications or patch files are typically prohibited. The purpose of this project is for 
proof of concept and to create local modifications of electron apps. Developers of this project are not responsible 
should our software lead you to violate an agreement or license. 
