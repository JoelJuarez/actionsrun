const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const posApp = require('./posApp');

// versionCode — A positive integer [...] -> https://developer.android.com/studio/publish/versioning
const versionCodeRegexPattern = /(versionCode(?:\s|=)*)(.*)/;
// versionName — A string used as the version number shown to users [...] -> https://developer.android.com/studio/publish/versioning
const versionNameRegexPattern = /(versionName(?:\s|=)*)(.*)/;

const environmentRegexPattern = /(variantFlavor(?:\s|=)*)(.*)/;


function versionPocket () {
        try {
        const platform = core.getInput('platform');
        if (platform === 'android') {
            // path del gradle
            const gradlePath = core.getInput('gradlePath');
            //version actual
            const versionName = core.getInput('versionNumber');
            //commit message
            const commitMessage = core.getInput('commitMessage');
            //configuration selected
            const configurationValue = core.getInput('configuration');
             
            const inputVersion = core.getInput('numberVersion');
               
                
            var versionComment = 0
            if (environmentRegexPattern.test(commitMessage)) {
              var  versionComment = validateQA(commitMessage);
            } else if (environmentRegexPattern.test(configurationValue)) {
               var  versionComment =  validateQA(configurationValue);
            } else {
                 console.log(`Error no contiene el formato correcto ejemplo: (variantFlavor:QA1@AG1@AQA1@Quality@&&)}`);
                 return
            }
             
            var versionParts = versionName.split('.');
             console.log(`versionComment : ... ${versionComment}`);
            if (inputVersion) {
                 console.log(`succes : ... ${inputVersion}`);
             var versionParts = inputVersion.split('.');
            } else if (versionComment != "v0") {
                  var versionParts = versionComment.split('.');
            } else {
                 console.log(`Error : ... ${versionParts}`);
            }
            
            let finalNewVersion = '';
            let newVersionParts = versionParts[versionParts.length -1];

            let lastPartMayor = 1;
            let lastPartMinor = 0;
            let lastPartVersion = 0;
            
            if(newVersionParts.length > 0) {
                lastPartMayor = parseInt(versionParts[0].substring(1));
                lastPartMinor = parseInt(versionParts[1]);
                if (inputVersion) { 
                    lastPartVersion = parseInt(versionParts[2]);
                }  else if (versionComment && versionComment != "v0") {
                   lastPartVersion = parseInt(versionParts[2]);
                } else {
                   lastPartVersion = parseInt(versionParts[2]) + 1;
                }
              
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


} //Close app Pocket

function versionPosMovil() {
     console.log(`versionPosMovil ---> versionPosMovil <---`); 
}


function validateQA (commitValue) {
     // se debe recibir lo sigueinte : variantFlavor:SIT1@SITAG1@ASIT2@Sit@v8.7.8@&&
     // salidas:
     // Assemble: -assembleQA1AG1AQA1Quality
     // path apk : - QA1AG1ADEB1/quality/app-QA1-AG1-ADEB1-quality.apk
     // Donde : 
       // QA1      - 0 Eendpoint
       // @AG1     - 1 apigee
       // @AQA1    - 2 Auth0 path
       // @Quality - 3 Environment
       // @Quality - 4 version app
    

   //Eendpoint @ apigee @ Auth0  @ Environment @version
     let variantVar = commitValue.indexOf("variantFlavor:");
     let closeString = commitValue.indexOf("&&");
     let flavorValue = commitValue.substring(variantVar + 14, closeString);
  
        console.log(`commitMessage function -->  ${commitValue} <---`);
         
        let data  = flavorValue.split('@');
        if (data.length > 0) {
            let endpoint = data[0]
            let apigee = data[1]
            let auth = data[2]
            let environment = data[3]
            let newVersion = data[4]
            let assemble = "assemble"
            
            assemble += endpoint
            assemble += apigee
            assemble += auth
            assemble += environment
            
            console.log(`assembleValue ---> ${assemble} <---`); 
            
            core.setOutput( "assemble_value",`${assemble}`);
            
           // Creando path QA1 AG1 ADEB1 /quality/app-QA1-AG1-ADEB1-quality.apk
            
            let finalPath = ""
            finalPath += endpoint + "" + apigee + "" + auth
            finalPath += "/"
            finalPath += environment.charAt(0).toLowerCase() + environment.slice(1)
             finalPath += "/"
            finalPath += "app-"
            finalPath += endpoint + "-"
            finalPath += apigee + "-"
            finalPath += auth + "-"
            finalPath += environment.charAt(0).toLowerCase() + environment.slice(1)
            finalPath += ".apk"
            
            console.log(`finalPath ---> ${finalPath} <---`); 
            core.setOutput( "final_path_apk",`${finalPath}`);
     
             return newVersion
        }
    
  return "";
};

 const appVersion = core.getInput('aplication');

if (appVersion == "Pocket") {
    console.log(`Flow Pocket ******** `);
    versionPocket();
} else if (appVersion == "PosMovil") {
    console.log(`Flow PosMovil ******** `);
    versionPosMovil();
} else {
    console.log(`Error  ******** ${appVersion} nos existe el app`);
}
        

