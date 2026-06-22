import { KnowledgeBuilder } from '../knowledge-system/build';

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const builder = new KnowledgeBuilder();

  if (args.has('--retrospective')) {
    await builder.build(process.cwd(), true);
    return;
  }

  await builder.build(process.cwd(), !args.has('--incremental'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
