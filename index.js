const fs = require("fs");
const asar = require("asar");
const path = require("path");
const diff = require("diff");

module.exports = class {
    /**
     * Constructor for Positron
     * @param asarPackage Package to unpackage
     * @param sourceDir Directory to unpackage asarPackage to
     * @param patchDir Directory to create patches in
     */
    constructor(asarPackage, sourceDir, patchDir) {
        this.asarPackage = asarPackage;
        this.sourceDir = sourceDir;
        this.patchDir = patchDir;

        // Get package name
        this.packageName = asarPackage.split("/").pop();
        const nameParts = this.packageName.split(".");
        nameParts.pop();
        this.packageName = nameParts.join(".");

        // Check if asarPackage & directories exist
        if (!fs.existsSync(asarPackage)) throw new Error("asarPackage not found.");
        if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir);
        if (!fs.existsSync(patchDir)) fs.mkdirSync(patchDir);
    }

    /**
     * Unpackages the asar package
     */
    unpackage = () => {
        asar.extractAll(this.asarPackage, path.join(this.sourceDir, this.packageName));
        asar.extractAll(this.asarPackage, path.join(this.sourceDir, ".positron", this.packageName));
        console.log("Unpackaged contents of " + this.asarPackage + " to " + this.sourceDir);
    }

    /**
     * Creates patches for any modified files
     */
    makePatches = (directory) => {
        const dir = (directory) ? directory : this.sourceDir;
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const sourcePath = path.join(dir, file);
            const name = sourcePath.split("/").pop();
            const localDir = sourcePath.slice(this.sourceDir.length);
            const patchPath = path.join(this.patchDir, localDir);

            if (fs.statSync(sourcePath).isDirectory() && !sourcePath.endsWith("node_modules") && !sourcePath.endsWith(".positron")) {
                if (!fs.existsSync(patchPath)) fs.mkdirSync(patchPath, { recursive: true });
                this.makePatches(sourcePath);
            } else {
                if (!file.endsWith("node_modules") && !file.endsWith(".positron")) {
                    console.log("Checking " + sourcePath);
                    fs.readFile(sourcePath, 'utf8',(err, fileData) => {
                        if (err) throw err;
                        fs.readFile(path.join(this.sourceDir, "..", ".positron", localDir), 'utf8', (err, originalData) => {
                            if (err) throw err;
                            const patchData = diff.createPatch(name, originalData, fileData, "", "");
                            const patchFile = patchPath + ".patch";
                            if (patchData.split(/\r\n|\r|\n/).length > 5) {
                                if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
                                fs.writeFile(patchFile, patchData, (err) => {
                                    if (err) throw err;
                                    console.log("Created patch: " + patchFile);
                                });
                            } else if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
                        });
                    });
                }
            }
        });
    }

    applyPatches = (directory) => {
        const dir = (directory) ? directory : this.patchDir;
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const sourcePath = path.join(dir, file);
            const localDir = sourcePath.slice(this.patchDir.length);
            console.log(localDir);
            if (fs.statSync(sourcePath).isDirectory()) this.applyPatches(sourcePath);
            else {
                const destPath = path.join(this.sourceDir, localDir.slice(0, -6));
                console.log("Applying patch " + sourcePath + " to " + destPath);

                fs.readFile(sourcePath, 'utf8', (err, sourceData) => {
                   if (err) throw err;
                   fs.readFile(destPath, 'utf8', (err, destData) => {
                       if (err) throw err;
                       const newData = diff.applyPatch(destData, sourceData);
                       if (newData !== false) {
                           fs.writeFile(destPath, newData, (err) => {
                               if (err) throw err;
                               console.log("Applied patch to " + destPath);
                           });
                       } else console.log("Skipping patch for " + destPath);
                   })
                });
            }
        });
    }

    package = () => {
        const originPackage = this.asarPackage.slice(0, -5) + "-original.asar";
        if (fs.existsSync(originPackage)) {
            asar.createPackage(this.sourceDir, this.asarPackage).then((res) => {
                console.log("Created package from sources.");
            }).catch(console.error);
        } else {
            fs.copyFile(this.asarPackage, originPackage, (err) => {
                if (err) throw err;
                asar.createPackage(this.sourceDir, this.asarPackage).then((res) => {
                    console.log("Created package from sources.");
                }).catch(console.error);
            })
        }
    }
}