export class Utils {

    constructor(){}
      

    sanitize(unsafe_str:string|null) : string |null {
        if(unsafe_str == null){
            return null;
        }
        return unsafe_str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('/', '&#x2F;').replaceAll('`', '&#x60;').replaceAll('=', '&#x3D;');
    }

    passwordSanitize(unsafe_str:string|null) : string |null {
        if(unsafe_str == null){
            return null;
        }
        return unsafe_str.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('`', '&#x60;');
    }


    vaultToJson(vault:  Map<string, Map<string, string>>):string{
        const jsonObject: { [key: string]: { [key: string]: string } } = {};
        for (const [key, value] of vault) {
          jsonObject[key] = {};
          for (const [nestedKey, nestedValue] of value) {
            jsonObject[key][nestedKey] = nestedValue;
          }
        }

        return JSON.stringify(jsonObject);

    }

    vaultFromJson(json:string): Map<string, Map<string, string>>{

        // Convertir la chaîne JSON en objet JSON
        const jsonObject = JSON.parse(json);

        // Convertir l'objet JSON en Map TypeScript
        const map = new Map<string, Map<string, string>>();
        for (const key in jsonObject) {
          if (jsonObject.hasOwnProperty(key)) {
            const nestedObject = jsonObject[key];
            const nestedMap = new Map<string, string>();
            for (const nestedKey in nestedObject) {
              if (nestedObject.hasOwnProperty(nestedKey)) {
                nestedMap.set(nestedKey, nestedObject[nestedKey]);
              }
            }
            map.set(key, nestedMap);
          }
        }

       return map;
         }

      mapToJson(map: Map<string, string>):string{
        const jsonObject: { [key: string]: string } = {};
        for (const [key, value] of map) {
          jsonObject[key] = value;
        }
        return JSON.stringify(jsonObject);
      }

      mapFromJson(json:string): Map<string, string>{
        const jsonObject = JSON.parse(json);

        const map = new Map<string, string>();
        for (const key in jsonObject) {
          if (jsonObject.hasOwnProperty(key)) {
            map.set(key, jsonObject[key]);
          }
        }
        return map;
      }
}
