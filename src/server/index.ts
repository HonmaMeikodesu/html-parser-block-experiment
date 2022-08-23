import { createServer } from "http";
import { URL } from "url";

const server = createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    if (urlObj.pathname === "/blockingCss") {
        setTimeout(() => {
            res.write(
                `
                    <style>
                        .container {
                            height: 1000px;
                        }
                    </style>
                `
            );
            res.end();
        }, parseInt(urlObj.searchParams.get("delay")) || 3000)
        return;
    }
    if (urlObj.pathname === "/blockingJs") {
        setTimeout(() => {
            res.write(
                `console.log("hello!")`
            );
        }, 3000)
    }
    if (urlObj.pathname === "/streamingHtml") {
        res.setHeader("Content-Type", "text/html");
        res.write(`<!DOCTYPE html>
        <html lang="en">
        <head>
        `);
        setTimeout(() => {
            res.write(`
                <style>
                    .container {
                        height: 1000px;
                        background-color: red;
                    }
                </style>
            </head>
            <body>
                <div class="container">
            `);
            setTimeout(() => {
                res.write(
                    `   Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugit, dolor quibusdam aliquam ullam reprehenderit perferendis quae accusamus. Animi deserunt maiores, eius, natus assumenda quo ut delectus veritatis perferendis eaque iure?
                        </div>
                    </body>
                    `
                );
                setTimeout(() => {
                    // 背景永远不会变灰，因为<style>标签不支持流式解析，<script>同理
                    res.write(`
                            <style>
                                .container {
                                    height: 1000px;
                                    background-color: gray !important;
                                }
                    `);
                    setTimeout(() => {
                        res.write(`
                        .container {
                            height: 1000px;
                            background-color: blue !important;
                        }
                            </style>
                        </html>
                        `);
                        res.end();
                    }, 3000)
                }, 3000)
            }, 3000);
        },3000)
    }
    if (urlObj.pathname === "/blockingCssHtml") {
        // 两个delay 2000ms的段落同时出现，只有被delay了5000ms的最后出现
        // 1，css加载时确实会block DOM的渲染
        // 2，任何资源加载都不会block DOM的解析，不然你下完一个1G的文件，才继续往下扫，扫到另外一个1G的文件，才开始下载，这显然是不合理的
        res.write(
            `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <link rel="stylesheet" href="/blockingCss?delay=2000">
                    </head>
                    <body>
                        <div class="container">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <link rel="stylesheet" href="/blockingCss?delay=2000">
                        <div>Esse et facilis incidunt unde fugiat placeat error impedit sint sit!
                        <link rel="stylesheet" href="/blockingCss?delay=5000">
                        </div>
                        <div>Debitis quasi accusamus dolore cumque eius consequuntur aut id error molestias?</div>
                        </div>
                    </body>
                </html>
            `
        );
        res.end();
    }
})

server.listen(1298);