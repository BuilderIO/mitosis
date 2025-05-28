import { build } from 'gluegun';
import { Toolbox } from 'gluegun/build/types/domain/toolbox';
import { getToolboxInfo } from './helpers/get-toolbox-info';

const help = (toolbox: Toolbox) => toolbox.print.info(getToolboxInfo(toolbox));

/**
 * Create the cli and kick it off
 */
async function run(argv: any) {
  // create a CLI runtime
  const cli = build()
    .brand('mitosis')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'mitosis-*', hidden: true })
    .help(help) // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    .exclude([])
    .create();
  // and run it
  const toolbox = await cli.run(argv);

  // send it back (for testing, mostly)
  return toolbox;
}

module.exports = { run };
