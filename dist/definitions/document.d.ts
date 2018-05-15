import { AConnection, ATransaction } from "gdmn-db";
export declare type LoadDocumentFunc = (id: number, ruid: string, parent_ruid: string, name: string, className: string, hr: string, lr: string) => void;
export declare function loadDocument(connection: AConnection, transaction: ATransaction, loadDocumentFunc: LoadDocumentFunc): Promise<void>;
