import Dexie from "dexie";

const dexie = new Dexie("MainDatabase");

dexie.version(1).stores({
	chatDraft: "++id, [username+contact], content, creationTime",
});

export default dexie;