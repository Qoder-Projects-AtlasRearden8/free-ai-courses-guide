# 05. Deep learning and the math behind it

**Intermediate to advanced · Several months**

> Build neural networks, connect the code to the mathematics, and document results in a way another person can reproduce.

[Guide home](README.md) · [Certificate guide](certificates.md) · [Learning paths](learning-paths.md) · [Full library](full-library.md)

This is the slower route for people who want to understand the machinery rather than only call an API. It is fine to loop back, skip proofs on a first pass, and learn the math in the context of code you have actually run.

Start with intuition and a working model. 3Blue1Brown's visual series is a gentle companion, Kaggle's four-hour Intro to Deep Learning gets a neural network running, and fast.ai builds practical models while quickly giving you real datasets and failure modes. MIT 6.S191 adds a fast, research-oriented survey; it is labeled introductory but assumes more mathematical maturity than the beginner shelf.

Dive into Deep Learning is the best all-in-one bridge from explanation to implementation. Mathematics for Machine Learning fills in linear algebra, probability, and optimization when a concept blocks you. Goodfellow, Bengio, and Courville's Deep Learning is a reference to grow into, not a first book to force yourself through.

The finish line is not coverage. Pick one small model, baseline, or fine-tuning experiment. Record the data, compute budget, metric, and failure cases. Write a model card for a non-expert. That is more useful evidence than a folder of completed notebooks you cannot explain.

**Best for:** Builders who have finished a first machine-learning project and want the math, model internals, and research habits behind modern deep learning.

## Courses at a glance

| Course | Provider | Level | Time | Cost | Free certificate? | What it covers |
| --- | --- | --- | --- | --- | --- | --- |
| [Kaggle: Intro to Deep Learning](https://www.kaggle.com/learn/intro-to-deep-learning) | Kaggle Learn | Intermediate | 4 hours | Free | **Free certificate** | Deep learning, TensorFlow, Python |
| [Practical Deep Learning for Coders](https://course.fast.ai/) | fast.ai | Intermediate | 9 lessons (~90 min each) + practice | Free | No certificate | Deep learning, PyTorch, Projects |
| [MIT Introduction to Deep Learning (6.S191)](https://introtodeeplearning.com/) | MIT | Advanced | Semester lectures + labs | Free | No certificate | Deep learning, Research, Python |

Every course above is free to learn in some form, but "free to learn" is not the same as "free certificate." The access and certificate columns are part of the recommendation, not a footnote.

## Courses, one by one

### [Kaggle: Intro to Deep Learning](https://www.kaggle.com/learn/intro-to-deep-learning)

**Kaggle Learn** · Intermediate · 4 hours · Interactive notebooks

Use TensorFlow and Keras to build a first neural network, add layers, train with stochastic gradient descent, and recognize overfitting. Four focused hours with a free certificate attached.

- **Access:** Free
- **Certificate:** Free Kaggle Learn completion certificate.
- **Topics:** Deep learning, TensorFlow, Python

### [Practical Deep Learning for Coders](https://course.fast.ai/)

**fast.ai** · Intermediate · 9 lessons (~90 min each) + practice · Video lessons + notebooks

Jeremy Howard's nine-lesson, code-first course takes you from training a first model to deploying practical deep-learning projects. It is free and famously approachable, but it is not a first coding course.

- **Access:** Free
- **Certificate:** No certificate is offered; the course emphasizes working projects.
- **Topics:** Deep learning, PyTorch, Projects

### [MIT Introduction to Deep Learning (6.S191)](https://introtodeeplearning.com/)

**MIT** · Advanced · Semester lectures + labs · Lectures + labs

MIT's fast-paced introduction to deep learning: nine lectures and three software labs spanning vision, sequence models, generative AI, and more. The site labels it beginner-friendly, but calculus and linear algebra help.

- **Access:** Free
- **Certificate:** No certificate is listed; course materials are openly available.
- **Topics:** Deep learning, Research, Python


## Free books and reference

- [Deep Learning for Coders with fastai and PyTorch](https://fastai.github.io/fastbook2e/) — fast.ai. Intermediate, 20+ hours. The free online edition of Jeremy Howard and Sylvain Gugger's hands-on deep-learning book. It is the companion to the fast.ai course and assumes you can already code.
- [Dive into Deep Learning](https://d2l.ai/) — D2L.ai. Advanced, Semester-scale. An open, interactive deep-learning textbook that combines math, prose, and runnable code. Adopted by hundreds of universities; free online, with a print edition if you prefer paper.
- [Mathematics for Machine Learning](https://mml-book.github.io/) — MML Book. Advanced, Reference. A free textbook that fills the math gaps behind machine learning: linear algebra, analytic geometry, probability, optimization, and modeling. Use selected chapters as a companion, not a prerequisite gate.
- [Deep Learning](https://www.deeplearningbook.org/) — MIT Press. Advanced, Reference. The canonical deep-learning reference by Goodfellow, Bengio, and Courville, free to read in HTML. It is rigorous and dense—a reference to grow into, not a first book for most beginners.

## Official channels

- [3Blue1Brown](https://www.youtube.com/@3blue1brown) — 3Blue1Brown. All levels, Watch 2–3 videos. Visual, carefully paced explanations of neural networks, calculus, and linear algebra. Start with the neural-network series when jargon starts to blur; the animations build intuition faster than definitions alone.
- [Andrej Karpathy](https://www.youtube.com/@AndrejKarpathy) — Andrej Karpathy. Advanced, Watch one lecture. Deep, code-first explanations of language models, backpropagation, and building neural networks from scratch. Best when you have some Python and want to understand what is happening under the hood.
- [Google DeepMind](https://www.youtube.com/@GoogleDeepMind) — Google DeepMind. All levels, Ongoing. Research talks, explainers, and glimpses of frontier AI work in science, models, and safety. A good channel for context on where the field is going—and what is still research, not a product.

## A sensible order

You do not need every resource. This order keeps the next step small:

1. [3Blue1Brown](https://www.youtube.com/@3blue1brown) — 3Blue1Brown; Watch 2–3 videos; All levels. Visual, carefully paced explanations of neural networks, calculus, and linear algebra. Start with the neural-network series when jargon starts to blur; the animations build intuition faster than definitions alone.
2. [Kaggle: Intro to Deep Learning](https://www.kaggle.com/learn/intro-to-deep-learning) — Kaggle Learn; 4 hours; Intermediate. Use TensorFlow and Keras to build a first neural network, add layers, train with stochastic gradient descent, and recognize overfitting. Four focused hours with a free certificate attached.
3. [Practical Deep Learning for Coders](https://course.fast.ai/) — fast.ai; 9 lessons (~90 min each) + practice; Intermediate. Jeremy Howard's nine-lesson, code-first course takes you from training a first model to deploying practical deep-learning projects. It is free and famously approachable, but it is not a first coding course.
4. [MIT Introduction to Deep Learning (6.S191)](https://introtodeeplearning.com/) — MIT; Semester lectures + labs; Advanced. MIT's fast-paced introduction to deep learning: nine lectures and three software labs spanning vision, sequence models, generative AI, and more. The site labels it beginner-friendly, but calculus and linear algebra help.
5. [Dive into Deep Learning](https://d2l.ai/) — D2L.ai; Semester-scale; Advanced. An open, interactive deep-learning textbook that combines math, prose, and runnable code. Adopted by hundreds of universities; free online, with a print edition if you prefer paper.
6. [Mathematics for Machine Learning](https://mml-book.github.io/) — MML Book; Reference; Advanced. A free textbook that fills the math gaps behind machine learning: linear algebra, analytic geometry, probability, optimization, and modeling. Use selected chapters as a companion, not a prerequisite gate.

## Certificate reality

Kaggle's Intro to Deep Learning certificate is free. The listed university courses, open textbooks, fast.ai course, and YouTube channels do not include free certificates. The durable evidence here is a reproducible project, training log, and model card.

A completion certificate is a record that you finished a defined piece of learning. It is not an accredited degree, a professional license, or proof that you can do the work unsupervised. See [the certificate guide](certificates.md) for the provider-by-provider rules.

## A small proof of work

Produce a reproducible model study: baseline, one clear hypothesis, training code, evaluation beyond a single score, compute notes, and a plain-language model card that names who should not rely on it.

## Where next

Specialize in evaluation, interpretability, efficient fine-tuning, or safety—and keep shipping small projects while you read. Open [the matching learning path](learning-paths.md#deep-learning) for a longer sequence, or return to [the guide index](README.md) to choose another shelf.

---

Verified October 23, 2026. Course access and certificate rules can change; check the provider's page before enrolling. Independent guide by ASDALE DYNAMICS, LLC. Education only—not medical, legal, or financial advice.

[Back to the guide index](README.md)
