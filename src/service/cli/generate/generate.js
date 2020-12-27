'use strict';

const {
  logger,
  paintMessage,
  generatePublications,
  getMockedPublicationsData,
} = require(`~/helpers`);
const {
  CliCommandName,
  CliExitCode,
  MessageColor,
  MocksConfig,
} = require(`~/common/enums`);
const {savePublicationsToFile} = require(`./helpers`);

module.exports = {
  name: CliCommandName.GENERATE,
  async run(args) {
    const [count] = args;
    const publicationsCount = Number(count) || MocksConfig.DEFAULT_COUNT;
    if (publicationsCount > MocksConfig.MAX_COUNT) {
      logger.error(
          paintMessage(
              `An error occurred on creating mocked data: No more than 1000 publications.`,
              MessageColor.RED
          )
      );
      process.exit(CliExitCode.ERROR);
    }

    const {titles, descriptions, categories, comments} = await getMockedPublicationsData();
    const mockedPublications = generatePublications({
      count: publicationsCount,
      titles,
      descriptions,
      categories,
      comments,
    });

    await savePublicationsToFile(mockedPublications);
  },
};
