import AppLayout from '@/Layouts/AppLayout';

export const withLayout = (Component) => {
  Component.layout = (page) => {
    console.log(page); // cek isinya apa
    return <AppLayout title={page.props?.title}>{page}</AppLayout>;
  };
  return Component;
};