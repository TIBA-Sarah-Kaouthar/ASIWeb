<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, toRaw } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const openForm = (parcours: Parcours | null = null) => {
  isOpen.value = true;

  if (parcours) {
    currentParcours.value = structuredClone(toRaw(parcours));
  }
};

const closeForm = () => {
  isOpen.value = false;
  currentParcours.value = new Parcours(null, null, null);
};

const props = defineProps({
  parcours: {
    type: Object as () => Parcours | null,
    required: false,
    default: null,
  },
});

onBeforeMount(() => {
  if (props.parcours) {
    currentParcours.value = props.parcours;
  }
});

defineExpose({
  openForm,
  closeForm,
});
</script>