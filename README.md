# Positron
Node framework for unpacking, patching, and re-packing [electron](https://www.electronjs.org) applications

## Usage
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
