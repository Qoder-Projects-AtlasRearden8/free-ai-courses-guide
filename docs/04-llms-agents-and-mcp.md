# 04. LLMs, agents, and MCP

**Intermediate · 2 hours to several weeks**

> Move from a prompt in a chat box to a small, constrained program that can call tools without giving away the keys.

[Guide home](README.md) · [Certificate guide](certificates.md) · [Learning paths](learning-paths.md) · [Full library](full-library.md)

This category is for people who can already write a little Python and want to build. It covers prompting, model APIs, retrieval, agent loops, and the Model Context Protocol (MCP)—with honest limits on what "agentic" actually means.

Begin with the model layer, not the hype layer. DeepLearning.AI's prompting short course is free to watch and still one of the clearest introductions to instructions, formats, and iterative improvement. Microsoft's Generative AI for Beginners is a broad, code-included curriculum for context. Hugging Face's LLM course is the structured route when you want transformers, datasets, fine-tuning, and evaluation.

Agents are loops: a goal, a set of tools, observations, and a stop condition. Hugging Face's Agents and MCP courses provide structured practice and free certificates for their fundamentals and completion tracks. Microsoft's open curricula give you another perspective and more implementation detail. Kaggle's 5-day intensive can add community structure, but its cohort badges and certificates have changed between sessions, so treat the current guide as the source of truth.

Two practical additions matter for local-first work. GitHub Copilot Fundamentals is a free Microsoft Learn path on AI-assisted coding, prompt engineering, and responsible use. Ollama's official quickstart shows how to run an open model on your own machine and connect it to an app or coding agent—useful when privacy, cost, or offline access matters.

Build small and read-only first. A calculator, a public-data lookup, or a local notes search is enough to learn the pattern. Require explicit human confirmation before any write action. Never place API keys in a repository, screenshot, prompt, or shared notebook; use environment variables and a local secret store.

**Best for:** Builders with basic Python who want to make LLM-backed tools, use an AI coding assistant, run models locally, or connect models to outside data while keeping permissions clear.

## Courses at a glance

| Course | Provider | Level | Time | Cost | Free certificate? | What it covers |
| --- | --- | --- | --- | --- | --- | --- |
| [ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) | DeepLearning.AI | Beginner | 1 hr 40 min | Free lessons | Paid certificate | Prompting, LLM APIs, Python |
| [GitHub Copilot Fundamentals Part 1 of 2](https://learn.microsoft.com/en-us/training/paths/copilot/) | Microsoft Learn | Beginner | 9 modules (self-paced) | Free | No certificate | GitHub Copilot, AI coding, Prompt engineering |
| [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners) | Microsoft | Beginner | 21 lessons (self-paced) | Free | No certificate | LLMs, RAG, Prompts, Python |
| [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course) | Hugging Face | Intermediate | 3–4 hours per unit | Free | **Free certificate** | AI agents, Tool use, Python |
| [Hugging Face MCP Course](https://huggingface.co/learn/mcp-course) | Hugging Face | Intermediate | 3–4 hours per unit | Free | **Free certificate** | MCP, AI tools, Anthropic |
| [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners) | Microsoft | Intermediate | 18 lessons (self-paced) | Free | No certificate | AI agents, RAG, Tools |
| [MCP for Beginners](https://github.com/microsoft/mcp-for-beginners) | Microsoft | Intermediate | 15+ modules (self-paced) | Free | No certificate | MCP, Security, Tools |
| [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/) | DeepLearning.AI | Intermediate | ~2 hours | Free lessons | Paid certificate | MCP, Anthropic, Python |
| [5-Day AI Agents Intensive Course with Google](https://www.kaggle.com/learn-guide/5-day-agents) | Kaggle Learn | Intermediate | 5 days + project | Free | Certificate varies | AI agents, Google, Capstone |
| [Hugging Face LLM Course](https://huggingface.co/learn/llm-course) | Hugging Face | Intermediate | 6–8 hours per chapter | Free | No certificate | LLMs, Transformers, Fine-tuning |

Every course above is free to learn in some form, but "free to learn" is not the same as "free certificate." The access and certificate columns are part of the recommendation, not a footnote.

## Courses, one by one

### [ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)

**DeepLearning.AI** · Beginner · 1 hr 40 min · Short course

A 1 hour 40 minute course on writing clear instructions, summarizing, inferring, transforming, and expanding text with an LLM API. Basic Python is helpful, but the prompting principles apply far beyond code.

- **Access:** Free lessons
- **Certificate:** Lessons are free; a certificate requires DeepLearning.AI PRO membership.
- **Topics:** Prompting, LLM APIs, Python

### [GitHub Copilot Fundamentals Part 1 of 2](https://learn.microsoft.com/en-us/training/paths/copilot/)

**Microsoft Learn** · Beginner · 9 modules (self-paced) · Self-paced learning path

A free, nine-module path on using GitHub Copilot responsibly: plan choices, prompt engineering, Copilot Spaces, advanced features, IDE and command-line use, developer workflows, and unit testing with an AI assistant.

- **Access:** Free
- **Certificate:** No certificate is issued for this learning path; Microsoft Learn tracks module completion.
- **Topics:** GitHub Copilot, AI coding, Prompt engineering

### [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners)

**Microsoft** · Beginner · 21 lessons (self-paced) · Open curriculum + code

Twenty-one lessons that move from prompt basics to retrieval-augmented generation, agents, and responsible use, with Python code samples. You can read the ideas without using Azure, though a little coding helps.

- **Access:** Free
- **Certificate:** No certificate is offered for this open curriculum.
- **Topics:** LLMs, RAG, Prompts, Python

### [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course)

**Hugging Face** · Intermediate · 3–4 hours per unit · Course + hands-on assignments

A free course from beginner to agent builder. Learn tool use, agent loops, smolagents, LlamaIndex, and LangGraph, then build and share an agent. Basic Python is expected; two free certificate levels are available.

- **Access:** Free
- **Certificate:** Certification is free: a fundamentals certificate after Unit 1, or a completion certificate after assignments and the final challenge.
- **Topics:** AI agents, Tool use, Python

### [Hugging Face MCP Course](https://huggingface.co/learn/mcp-course)

**Hugging Face** · Intermediate · 3–4 hours per unit · Course + hands-on projects

A free course built with Anthropic that explains the Model Context Protocol and walks you through building MCP applications. You should know basic AI, APIs, and either Python or TypeScript. Free certificates are available.

- **Access:** Free
- **Certificate:** Free fundamentals certificate after Unit 1; free completion certificate after the use-case units and assignments.
- **Topics:** MCP, AI tools, Anthropic

### [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners)

**Microsoft** · Intermediate · 18 lessons (self-paced) · Open curriculum + code

Eighteen open lessons on agent design patterns, retrieval, tool use, multi-agent systems, and responsible development, with runnable samples. Basic coding helps, and there is no certificate or paywall.

- **Access:** Free
- **Certificate:** No certificate is offered for this open curriculum.
- **Topics:** AI agents, RAG, Tools

### [MCP for Beginners](https://github.com/microsoft/mcp-for-beginners)

**Microsoft** · Intermediate · 15+ modules (self-paced) · Open curriculum + labs

A free, open curriculum on Model Context Protocol fundamentals, security, and practical labs, with examples across multiple languages. Useful as a reference shelf while you build your first MCP server.

- **Access:** Free
- **Certificate:** No certificate is offered for this open curriculum.
- **Topics:** MCP, Security, Tools

### [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/)

**DeepLearning.AI** · Intermediate · ~2 hours · Short course

A focused two-hour short course on building applications with the Model Context Protocol, made with Anthropic. You should be comfortable with Python and basic LLM concepts. Lessons are free.

- **Access:** Free lessons
- **Certificate:** Lessons are free; a certificate requires DeepLearning.AI PRO membership.
- **Topics:** MCP, Anthropic, Python

### [5-Day AI Agents Intensive Course with Google](https://www.kaggle.com/learn-guide/5-day-agents)

**Kaggle Learn** · Intermediate · 5 days + project · Guided intensive + capstone

A self-paced, hands-on agent program from Kaggle and Google: daily codelabs, whitepapers, a capstone project, and community discussion. It is free to follow; cohort-specific badges or certificates can change, so check the current guide.

- **Access:** Free
- **Certificate:** Cohort badges and certificates have changed between sessions. The official course guide is the source of truth.
- **Topics:** AI agents, Google, Capstone

### [Hugging Face LLM Course](https://huggingface.co/learn/llm-course)

**Hugging Face** · Intermediate · 6–8 hours per chapter · Readings + notebooks

A free, twelve-chapter course on transformers, datasets, tokenizers, fine-tuning, and modern LLM techniques using the Hugging Face ecosystem. It expects good Python and benefits from an intro deep-learning course.

- **Access:** Free
- **Certificate:** Hugging Face states that this course does not currently offer certification.
- **Topics:** LLMs, Transformers, Fine-tuning


## Free guides and access notes

- [Ollama Quickstart](https://docs.ollama.com/quickstart) — Ollama. Beginner, ~1 hour. An official quickstart for running open models locally: install Ollama, pull a model, connect a desktop app or coding agent, and make a first local API request without sending prompts to a hosted service.
- [Prompt Engineering (Google Whitepaper)](https://www.kaggle.com/whitepaper-prompt-engineering) — Google. Intermediate, ~1 hour. Google's free whitepaper on prompt engineering techniques, model settings, and real examples. It goes deeper than a list of magic phrases and gives you a vocabulary for why a prompt works.
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/) — Model Context Protocol. Advanced, Reference. The official open-standard documentation for MCP: architecture, servers, clients, tools, resources, and prompts. Use it as your reference when a course moves too fast, or when you are designing your own tool connection.

## Official channels

- [OpenAI](https://www.youtube.com/@OpenAI) — OpenAI. All levels, Ongoing. Official product demonstrations, developer sessions, and conversations about how AI systems are built and used. Treat launch videos as a starting point; verify claims against documentation.
- [Anthropic](https://www.youtube.com/@anthropic-ai) — Anthropic. Intermediate, Ongoing. Official talks and demos about Claude, agentic systems, safety research, and building with MCP. Helpful context for the agent-building path, especially around evaluation and guardrails.
- [Hugging Face](https://www.youtube.com/@HuggingFace) — Hugging Face. Intermediate, Ongoing. Practical demos and tutorials for models, datasets, agents, and open-source AI tooling. Useful when you want to see a workflow before reading the documentation.
- [Microsoft Developer](https://www.youtube.com/@MicrosoftDeveloper) — Microsoft Developer. Intermediate, Ongoing. Developer-focused demos and deep dives on Azure AI, Copilot, agents, and open-source tooling. Look for the hands-on sessions where you can follow along with code.
- [Google Cloud Tech](https://www.youtube.com/@googlecloudtech) — Google Cloud Tech. Intermediate, Ongoing. Practical Google Cloud AI demos, Gemini walkthroughs, and engineering talks. Best used with a project in hand rather than watched passively.
- [DeepLearning.AI](https://www.youtube.com/@Deeplearningai) — DeepLearning.AI. All levels, Ongoing. Lectures, course previews, and interviews about AI careers and building with LLMs. Useful for deciding which DeepLearning.AI course fits your next step.

## A sensible order

You do not need every resource. This order keeps the next step small:

1. [ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) — DeepLearning.AI; 1 hr 40 min; Beginner. A 1 hour 40 minute course on writing clear instructions, summarizing, inferring, transforming, and expanding text with an LLM API. Basic Python is helpful, but the prompting principles apply far beyond code.
2. [GitHub Copilot Fundamentals Part 1 of 2](https://learn.microsoft.com/en-us/training/paths/copilot/) — Microsoft Learn; 9 modules (self-paced); Beginner. A free, nine-module path on using GitHub Copilot responsibly: plan choices, prompt engineering, Copilot Spaces, advanced features, IDE and command-line use, developer workflows, and unit testing with an AI assistant.
3. [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners) — Microsoft; 21 lessons (self-paced); Beginner. Twenty-one lessons that move from prompt basics to retrieval-augmented generation, agents, and responsible use, with Python code samples. You can read the ideas without using Azure, though a little coding helps.
4. [Ollama Quickstart](https://docs.ollama.com/quickstart) — Ollama; ~1 hour; Beginner. An official quickstart for running open models locally: install Ollama, pull a model, connect a desktop app or coding agent, and make a first local API request without sending prompts to a hosted service.
5. [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course) — Hugging Face; 3–4 hours per unit; Intermediate. A free course from beginner to agent builder. Learn tool use, agent loops, smolagents, LlamaIndex, and LangGraph, then build and share an agent. Basic Python is expected; two free certificate levels are available.
6. [Hugging Face MCP Course](https://huggingface.co/learn/mcp-course) — Hugging Face; 3–4 hours per unit; Intermediate. A free course built with Anthropic that explains the Model Context Protocol and walks you through building MCP applications. You should know basic AI, APIs, and either Python or TypeScript. Free certificates are available.
7. [AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners) — Microsoft; 18 lessons (self-paced); Intermediate. Eighteen open lessons on agent design patterns, retrieval, tool use, multi-agent systems, and responsible development, with runnable samples. Basic coding helps, and there is no certificate or paywall.
8. [MCP for Beginners](https://github.com/microsoft/mcp-for-beginners) — Microsoft; 15+ modules (self-paced); Intermediate. A free, open curriculum on Model Context Protocol fundamentals, security, and practical labs, with examples across multiple languages. Useful as a reference shelf while you build your first MCP server.
9. [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/) — DeepLearning.AI; ~2 hours; Intermediate. A focused two-hour short course on building applications with the Model Context Protocol, made with Anthropic. You should be comfortable with Python and basic LLM concepts. Lessons are free.
10. [5-Day AI Agents Intensive Course with Google](https://www.kaggle.com/learn-guide/5-day-agents) — Kaggle Learn; 5 days + project; Intermediate. A self-paced, hands-on agent program from Kaggle and Google: daily codelabs, whitepapers, a capstone project, and community discussion. It is free to follow; cohort-specific badges or certificates can change, so check the current guide.
11. [Hugging Face LLM Course](https://huggingface.co/learn/llm-course) — Hugging Face; 6–8 hours per chapter; Intermediate. A free, twelve-chapter course on transformers, datasets, tokenizers, fine-tuning, and modern LLM techniques using the Hugging Face ecosystem. It expects good Python and benefits from an intro deep-learning course.

## Certificate reality

Hugging Face's fundamentals and full-course completion certificates are free, with different requirements per course. Kaggle's agent intensive certificate varies by cohort. DeepLearning.AI's short-course videos are free, but its certificates require PRO membership. Microsoft's open curricula do not include certificates, and MCP documentation is reference material. GitHub Copilot Fundamentals and Ollama's quickstart do not include certificates.

A completion certificate is a record that you finished a defined piece of learning. It is not an accredited degree, a professional license, or proof that you can do the work unsupervised. See [the certificate guide](certificates.md) for the provider-by-provider rules.

## A small proof of work

Ship one narrow, read-only tool with a README: the user, the problem, setup steps, a demo, the permissions it needs, where secrets live, two failure modes, and an explicit non-goal.

## Where next

Harden the project with tests, logging, and evaluation. If you want to understand the models underneath, move into deep learning and mathematics. Open [the matching learning path](learning-paths.md#build-with-ai) for a longer sequence, or return to [the guide index](README.md) to choose another shelf.

---

Verified October 23, 2026. Course access and certificate rules can change; check the provider's page before enrolling. Independent guide by ASDALE DYNAMICS, LLC. Education only—not medical, legal, or financial advice.

[Back to the guide index](README.md)
