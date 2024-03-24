import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

enum QuestionResponse {
  INDIFFERENT = "Indifferent",
  STRONGLY_AGREE = "Strongly Agree",
  STRONGLY_DISAGREE = "Strongly Disagree",
  DISAGREE = "Disagree",
  AGREE = "Agree",
}

type Questionnaire = Record<number, QuestionResponse>;

export const userRouter = createTRPCRouter({
  updateQuestionnaire: protectedProcedure
    .input(z.object({ questionnaire: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          questionnaire: input.questionnaire,
          onboarded: true,
        },
      });
    }),
  addItem: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input }) => {
      const mediaItem = await ctx.db.mediaItem.create({
        data: {
          title: "Russia mourns victims of concert shooting",
          url: "https://www.reuters.com/world/europe/russia-mourns-victims-deadly-concert-hall-attack-2024-03-24/",
          type: "article",
          content: `MOSCOW, March 24 (Reuters) - Russia lowered flags to half-mast on Sunday for a day of mourning after scores of people were gunned down with automatic weapons at a rock concert outside Moscow in the deadliest attack inside Russia for two decades.
          President Vladimir Putin declared a national day of mourning after pledging to track down and punish all those behind the attack, which left 133 people dead, including three children, and more than 150 were injured.
          "I express my deep, sincere condolences to all those who lost their loved ones," Putin said in an address to the nation on Saturday, his first public comments on the attack. "The whole country and our entire people are grieving with you."
          The Islamic State claimed responsibility for Friday's attack, but Putin has not publicly mentioned the militant group in connection with the attackers, who he said had been trying to escape to Ukraine, He asserted that some on "the Ukrainian side" had prepared to spirit them across the border.
          Ukraine has repeatedly denied any role in the attack, which Putin also blamed on "international terrorism".
          People laid flowers at Crocus City Hall, the 6,200-seat concert hall outside Moscow where four armed men burst in on Friday just before Soviet-era rock group Picnic was to perform its hit "Afraid of Nothing".
          The men fired their automatic weapons in short bursts at terrified civilians who fell screaming in a hail off bullets.
          It was the deadliest attack on Russian territory since the 2004 Beslan school siege, when Islamist militants took more than 1,000 people, including hundreds of children, hostage.
          Long lines formed in Moscow on Saturday to donate blood.
          In the southwestern city of Voronezh, people were laying flowers and lighting candles at a monument to children who died there in a World War Two bombing, in solidarity with those who died in the attack near Moscow.
          "We, like the whole country, are with you," the governor of the Voronezh region, Alexander Gusev, said on the Telegram messaging app.
          GUNMEN
          Putin said 11 people had been detained, including the four gunmen, who fled the concert hall and made their way to the Bryansk region, about 340 km (210 miles) southwest of Moscow.
          "They tried to hide and moved towards Ukraine, where, according to preliminary data, a window was prepared for them on the Ukrainian side to cross the state border," Putin said.
          Russia's Federal Security Service (FSB) said the gunmen had contacts in Ukraine and were captured near the border.
          Putin ordered a full-scale invasion of Ukraine in February 2022, triggering a major European war after eight years of conflict in eastern Ukraine between Ukrainian forces on one side and pro-Russian Ukrainians and Russian proxies on the other.
          Ukrainian President Volodymyr Zelenskiy said it was typical of Putin and "other thugs" to seek to divert blame.
          In video footage published by Russian media and Telegram channels with close ties to the Kremlin, one of the suspects said he was offered money to carry out the attack.
          "I shot people," the suspect, his hands tied and his hair held by an interrogator, a black boot beneath his chin, said in poor and highly accented Russian.
          When asked why, he said: "For money." The man said he had been promised half a million roubles (a little over $5,000). One was shown answering questions through a Tajik translator.
          ISLAMIC STATE
          Islamic State, the Islamist group that once sought control over swathes of Iraq and Syria, claimed responsibility for the attack, the group's Amaq agency said on Telegram.
          Putin changed the course of the Syrian civil war by intervening in 2015, supporting President Bashar al-Assad against the opposition and Islamic State.
          It was unclear why Islamic State chose this moment to strike Russia.
          The White House said the U.S. government shared information with Russia early this month about a planned attack in Moscow, and issued a public advisory to Americans in Russia on March 7. It said Islamic State bore sole responsibility for the attack.
          "There was no Ukrainian involvement whatsoever," U.S. National Security Council spokesperson Adrienne Watson said.
          `,
          description: "",
          note: "I really like learning about Russia",
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          mediaItems: {
            connect: { id: mediaItem.id },
          },
        },
      });
    }),
});
