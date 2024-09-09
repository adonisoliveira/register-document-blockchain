export type MainDocument = {
    documentHash: string;
    transactionId: string;
};

export type Document = {
    name: string;
    description: string;
    signatories: Array<string>;
    mainDocument: MainDocument
};

export type RegisterDocumentRequest = {
    documentHash: string;
    document: Document
};
