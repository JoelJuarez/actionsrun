const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

// versionCode — A positive integer [...] -> https://developer.android.com/studio/publish/versioning
const versionCodeRegexPattern = /(versionCode(?:\s|=)*)(.*)/;
// versionName — A string used as the version number shown to users [...] -> https://developer.android.com/studio/publish/versioning
const versionNameRegexPattern = /(versionName(?:\s|=)*)(.*)/;

function validateQA (commitValue) {
    //assembleQA1AG1Quality
        //Creando nombre deasseble y ruta de apk
        // auth0 0
        // @atg1 1
        // @QA1 2
        // @Quality 3
        console.log(`commitMessage function -->  ${commitValue} <---`);
    
        let data  = commitValue.split('@');
        if (data.length > 0) {
            let auth = data[0]
            let atg = data[1]
            let environment = data[2]
            let buildVariant = data[3]
            var assemble = "assemble"
            
            if (auth == "auth0") {
                    //assembleQA1AG1Quality
            }
            if (environment == "QA1") {
                assemble.concat('', environment)
            } else if (environment == "QA2") {
                 assemble.concat('', environment)
            }
            
            if (atg == "atg1") {
                assemble.concat('', atg)
                //assembleQA1AG1Quality
            } else if (atg == "atg2"){
                 assemble.concat('', atg)
                //assembleQA1AG1Quality
            }
            assemble.concat('', buildVariant)
            
            console.log(`assemble ---> ${assemble} <---`); 
            
            console.log(`::::  Informacion::: `);
            console.log(`auth -->  ${auth} <---`);
            console.log(`atg -->  ${atg} <---`);
            console.log(`environment -->  ${environment} <---`);
            console.log(`buildVariant -->  ${buildVariant} <---`);
        }
    
  return "";
};


try {
    const platform = core.getInput('platform');
    if (platform === 'android') {
        // path del gradle
        const gradlePath = core.getInput('gradlePath');
        //version actual
        const versionName = core.getInput('versionNumber');
        //commit message
        const commitMessage = core.getInput('commitMessage');
        
        validateQA(commitMessage);
   
        
        let versionParts = versionName.split('.');
        let finalNewVersion = '';
        let newVersionParts = versionParts[versionParts.length -1];

        let lastPartMayor = 1;
        let lastPartMinor = 0;
        let lastPartVersion = 0;
        
        if(newVersionParts.length > 0) {
            lastPartMayor = parseInt(versionParts[0].substring(1));
            lastPartMinor = parseInt(versionParts[1]);
            lastPartVersion = parseInt(versionParts[2]) + 1;
          
            if(lastPartVersion > 99) {
                lastPartVersion = 0;
                lastPartMinor = lastPartMinor + 1;
                if(lastPartMinor > 99) {
                    lastPartMinor = 0;
                    lastPartMayor = lastPartMayor + 1;
                }
            }
            finalNewVersion = `${lastPartMayor}.${lastPartMinor}.${lastPartVersion}`;
        }

        let versionCode = '';
        let versionFinalParts = finalNewVersion.split('.');
        
        versionFinalParts.forEach(element => {
            let newPart = element;
            if(element.length === 1) {
                newPart = `${element}0`;
            }
            versionCode = `${versionCode}${newPart}`;
        });

        fs.readFile(gradlePath, 'utf8', function (err, data) {
         
            if(!data) {
                 console.log(`data is Empty ${data}`);
                console.log(`Error : ... ${err}`);
            return
            }
            
            newGradle = data;
            if (versionCode.length > 0)
                newGradle = newGradle.replace(versionCodeRegexPattern, `$1${versionCode}`);
            if (versionName.length > 0){
                newGradle = newGradle.replace(versionNameRegexPattern, `$1\"${finalNewVersion}\"`);
                console.log(`finalNewVersion: ${finalNewVersion}`);
                core.setOutput( "new-version-number",`v${finalNewVersion}`);
            }
                
            fs.writeFile(gradlePath, newGradle, function (err) {
                if (err) throw err;
                if (versionCode.length > 0) {
                     console.log(`Successfully override versionCode ${versionCode}`)
                     console.log(`Version Name : ${versionCode}`);
                }
                   
             
                if (versionName.length > 0){
                    console.log(`Successfully override versionName ${versionName}`)
                    console.log(`Version Name : ${versionName}`);
                }
                
                core.setOutput("result", `Done`);
            });
        });
    }
} catch (error) {
    core.setFailed(error.message);
}
