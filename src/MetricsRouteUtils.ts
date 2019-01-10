import {Route} from "cassava/dist/routes";

export function getPathForMetricsLogging(evt: { path: string }, handlingRoutes: Route[]): string {
    let path: string = evt.path;

    const handler = (handlingRoutes[0] as any);
    if (handler && handler.settings && handler.settings.pathRegex) {
        let pathRegex: RegExp = handler.settings.pathRegex;

        path = pathRegex.toString();

        if (handler.settings.regexGroupToPathParamMap) {
            let pathParams: string[] = handler.settings.regexGroupToPathParamMap;
            let indexArray: number[] = [];

            function replacer(...args: any[]) {
                indexArray.push(args[1]);
                return `<${pathParams[indexArray.length]}>`;
            }

            path = path.replace(/\(.+?\)(?=\\\/|\$)/g, replacer);
        }

        path = path.replace(/\\\//g, "/");  // replace escaped slashes
        path = path.replace(/\/\^|\$\/[gimuy]/g, "");   // clear start/end markers & flags
    }

    return path;
}
