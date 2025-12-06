import { Locator, Page } from '@playwright/test';
import { ElementUtil } from  '../utils/ElementUtil';

export class ProductInfoPage {

    private readonly page: Page;
    private readonly eleUtil: ElementUtil;

    private readonly header: Locator;
    private readonly imageCount: Locator;
    private readonly productMetaData: Locator;
    private readonly productPriceData: Locator;

    private readonly productMap = new Map<string, string | number | null>();

    constructor(page: Page) {
        this.page = page;
        this.eleUtil = new ElementUtil(page);
        this.header = page.locator('h1');
        this.imageCount = page.locator('div#content img');
        this.productMetaData = page.locator("(//div[@id='content']//ul[@class='list-unstyled'])[1]/li");
        this.productPriceData = page.locator("(//div[@id='content']//ul[@class='list-unstyled'])[2]/li");
    }

    async getProductHeader(): Promise<string> {
        const header = await this.eleUtil.getInnerText(this.header);
        return header.trim();
    }

    async getProductImagesCount(): Promise<number> {
        await this.eleUtil.waitForElementVisible(this.imageCount);
        return this.imageCount.count();
    }

    async getProductDetails(): Promise<Map<string, string | number | null>> {
        this.productMap.set('header', await this.getProductHeader());
        this.productMap.set('imagecount', await this.getProductImagesCount());
        await this.getProductMetaData();
        await this.getProductPricingData();
        return this.productMap;
    }

    private async getProductMetaData() {
        const items = await this.productMetaData.allInnerTexts();
        for (const text of items) {
            const [key, val] = text.split(':');
            this.productMap.set(key.trim(), val.trim());
        }
    }

    private async getProductPricingData() {
        const items = await this.productPriceData.allInnerTexts();
        this.productMap.set('price', items[0].trim());
        this.productMap.set(
            'extaxprice',
            items[1].split(':')[1].trim()
        );
    }
}
