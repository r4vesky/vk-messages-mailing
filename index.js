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

  let { count } = await vk.api.messages.getConversations();

  let iterations = Math.round(count / 100);
  let ids = [];

  let startedAt = Date.now();

  console.log(`Iterations count: ${iterations}`);

  for (var index = 0; index < iterations; index++) {
    try {
      let currentIterationConversations =
        await vk.api.messages.getConversations({
          count: 100,
          offset: index * 100,
        });

      let { items } = currentIterationConversations;

      let user_ids = items
        .filter((item) => {
          let { conversation } = item;

          let isUser = conversation.peer.type === "user";
          let canWrite = conversation.can_write.allowed === true;

          return isUser && canWrite;
        })
        .map((item) => item.conversation.peer.id);

      ids = ids.concat(user_ids);
    } catch (e) {
      console.log(e);
    }
  }

  setTimeout(() => {
    console.log("Starting mailing...");
    console.log("------------------------------------------------");

    Array(iterations)
      .fill({})
      .forEach(async (_, index) => {
        let params = {
          user_ids: ids.slice(index * 100, index * 100 + 99),
          message,
          attachment,
          random_id: Math.random(),
        };

        if (Object.keys(keyboard).length > 0) {
          params["keyboard"] = JSON.stringify(keyboard);
        }

        await vk.api.messages.send(params);

        console.log(
          `Iteration #${index + 1} | Users: ${params.user_ids.length}`
        );

        if (index * 100 + 99 >= ids.length) {
          console.log(`------------------------------------------------`);
          console.log(`Completed in ${(Date.now() - startedAt) / 1000}s`);
          console.log(`Totally sended: ${ids.length} messages`);
        }
      });
  }, 1);
})();
