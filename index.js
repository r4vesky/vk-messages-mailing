const { VK } = require("vk-io");

const token = "";

const message = "";
const attachment = "";
const keyboard = {};

(async () => {
  if (token.length < 1) return console.log("Please, set the 'token' variable");

  if (message.length < 1)
    return console.log("Please, set the 'message' variable");

  const vk = new VK({
    token,
  });

  let { count } = await vk.api.messages.getConversations({ count: 100 });

  let iterations = Math.round(count / 100);
  let promises = [];

  let processedItems = 0;

  console.log(`Iterations count: ${iterations}`);

  for (var index = 0; index < iterations; index++) {
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          let currentIterationConversations =
            await vk.api.messages.getConversations({
              count: 100,
              offset: index * 100,
            });

          let { items } = currentIterationConversations;

          let itemsCount = items.length;

          processedItems += itemsCount;

          console.log(`Iteration: ${index + 1}, items: ${itemsCount}`);

          let user_ids = items
            .map((item) => item.conversation.peer.id)
            .join(",");

          let params = {
            user_ids,
            message,
            attachment,
            random_id: Math.random(),
          };

          if (Object.keys(keyboard).length > 0) {
            params["keyboard"] = JSON.stringify(keyboard);
          }

          await vk.api.messages.send(params);

          resolve();
        } catch (error) {
          reject(error);
        }
      })
    );
  }

  return Promise.all(promises)
    .finally(() => console.log(`Messages sended for ${processedItems} users`))
    .catch(console.error);
})();
