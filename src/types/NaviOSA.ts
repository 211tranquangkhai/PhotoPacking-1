export interface NavIOSA {
    id: number;
    product: string;
    productName?: string;
    step: number;
    stepTitle?: string;
    imagePath: string;
    standardDescription?: string;
    group?: "OSA" | "LXA";
    updatedBy?: string;
    updatedTime?: string;
}