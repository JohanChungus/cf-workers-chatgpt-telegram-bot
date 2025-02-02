export namespace Telegram {
    export interface Update {
        update_id: string
        message?: Message
        inline_query?: InlineQuery
        callback_query?: CallbackQuery
    }

    export interface Message {
        message_id: string
        from: From
        chat: Chat
        text: string
        reply_to_message?: Message
    }

    export interface InlineQuery {
        id: string
        from: From
        query: string
    }

    export interface CallbackQuery {
        id: string
        inline_message_id: string
        chat_instance: string
        from: From
        data: string
    }

    export interface From {
        username: string
        is_bot: boolean
    }

    export interface Chat {
        id: string
    }

    export function generateAnswerInlineQueryResponse(inlineQueryID: string, text: string): Response {
        return new Response(JSON.stringify({
            "method": "answerInlineQuery",
            "inline_query_id": inlineQueryID,
            "results": [
                {
                    "type": "article",
                    "id": inlineQueryID,
                    "title": "Query ChatGPT",
                    "input_message_content": {
                        "message_text": `Query:\n\`\`\`\n${text}\n\`\`\``,
                        "parse_mode": "Markdown",
                    },
                    "reply_markup": {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Confirm?",
                                    "callback_data": text
                                }
                            ]
                        ]
                    },
                    "description": "Send your query to ChatGPT (64 character limit, no context)",
                    "thumb_url": "https://raw.githubusercontent.com/jarylc/cf-workers-chatgpt-telegram-bot/master/cf-workers-chatgpt-telegram-bot.png"
                },
            ],
            "is_personal": true,
        }), {
            headers: {
                "content-type": "application/json",
            }
        })
    }

    export function generateAnswerCallbackQueryResponse(callbackQueryID: string): Response {
        return new Response(JSON.stringify({
            "method": "answerCallbackQuery",
            "callback_query_id": callbackQueryID,
            "text": "ChatGPT is processing your query",
        }), {
            headers: {
                "content-type": "application/json",
            }
        })
    }

    export async function sendEditInlineMessageText(token: string, inlineMessageID: string, query: string, response: string): Promise<Response> {
        return fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                "inline_message_id": inlineMessageID,
                "text": `Query: \`\`\`\n${query}\n\`\`\`\nAnswer: \n${sanitize(response)}`,
                "parse_mode": "Markdown",
            }),
        })
    }

    export function generateSendMessageResponse(chatID: string, text: string, additional_arguments?: { [key: string]: any }): Response {
        return new Response(JSON.stringify({
            "method": "sendMessage",
            "chat_id": chatID,
            "parse_mode": "Markdown",
            "text": sanitize(text),
            ...additional_arguments
        }), {
            headers: {
                "content-type": "application/json",
            }
        })
    }

    export function sanitize(text: string): string {
        const split = text.split(/(```.*)/g)
        let inCodeBlock = false;
        for (const i in split) {
            if (split[i].startsWith("```")) {
                inCodeBlock = !inCodeBlock
                continue
            }
            if (!inCodeBlock) {
                split[i] = split[i].replace("_", "\\_")
                    .replace("*", "\\*")
                    .replace("[", "\\[");
            }
        }
        return split.join("")
    }
}

