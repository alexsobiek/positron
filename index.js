const fs = require("fs");
const asar = require("asar");
const path = require("path");

module.exports = class {
    /**
     * Constructor for Positron
     * @param asarPackage Package to unpackage
     * @param sourceDir Directory to unpackage asarPackage to
     * @param patchDir Directory to create patches in
     */
    constructor(asarPackage, sourceDir, patchDir) {
        this.package = asarPackage;
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
        asar.extractAll(this.package, path.join(this.sourceDir, this.packageName));
        asar.extractAll(this.package, path.join(this.sourceDir, ".positron", this.packageName));
    }
}