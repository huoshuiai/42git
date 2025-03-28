import {initializeServer} from "./app"


initializeServer().catch(err=>{
  console.error(`Failed to initialize server: ${err}`);
})