<script setup lang="ts">
import { reactive, ref, watchEffect, onMounted } from "vue";
import { Situation } from "../../ai/Situation";
import { Scope } from "../../ai/Scope";

import LeftBoard from "../../components/LeftBoard.vue";
import RightBoard from "../../components/RightBoard.vue";
import Chat from "../../components/center/Chat.vue";
import Create from "../../components/center/Create.vue";
import Overview from "../../components/center/Overview.vue";
import SituationBoard from "../../components/center/Title.vue";
import FinishReport from "../../components/center/FinishReport.vue";
import VN from "../../components/center/VN.vue";
import Loading from "../../components/subcomponents/Loading.vue";
import { ScopeManager } from "../../ai/ScopeManager";
import AlertView from "../../components/AlertView.vue";
import { View } from "../../utils/view";

const generated = ref<boolean>(false);
const manager = ref<ScopeManager>();
const scope = reactive<Scope>(new Scope()) as Scope;
const situation = ref<Situation>();
const stage = ref<string>("generate");
const loaded = ref<boolean>(false);
const view = reactive<View>(new View('main')) as View;
// generated.value = true;

onMounted(() => {
  manager.value = new ScopeManager();
  manager.value.newScope(scope, new Date().toLocaleString());
  scope.initialize(manager.value.loadSavedSettings());
  loaded.value = true;
});

watchEffect(() => {
  situation.value = scope.getActiveSituation();
  stage.value = scope.getStage();
});
</script>

<template>
  <AlertView :scope="scope" />
  <div v-if="loaded" class="flex flex-col xl:flex-row w-full h-full">
    <LeftBoard :view="view" :situation="situation" :scope="scope"> </LeftBoard>
    <div :class="{'': view.current == 'main', 'hidden xl:flex': view.current != 'main'}" class="flex-col xl:h-full flex-grow overflow-y-auto">
      <Create v-if="stage == 'generate'" :scope="scope" />
      <Overview v-else-if="stage == 'overview'" :scope="scope" />
      <template
        v-else-if="
          stage == 'situations' && situation && scope.getActiveSituation()
        "
      >
        <SituationBoard :situation="situation" :scope="scope"></SituationBoard>
        
        <Chat :situation="situation" />
      </template>
      <FinishReport
        v-else-if="stage == 'report' && situation"
        :report="situation?.getReport()"
      />
      <Loading v-else />
    </div>
    <RightBoard :view="view" :manager="manager" :situation="situation" :scope="scope"> </RightBoard>
  </div>
  <Loading v-else />
</template>
